"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { getEpochTimeInSeconds } from "@/functions/makeDate/date";
import { fetchAllRows } from "@/functions/fetchAllRows";

/**
 * 経費。単発（在庫の仕入れ・修理代など）と、毎月の固定費（家賃・水道光熱費）の 2 本立て。
 *
 * ⚠️ **金額の単位は「円」。** collect_funds.fundsArray[].funds は**硬貨の枚数**
 *    （金額は × 100）。同じ画面に並ぶので取り違えないこと。
 *
 * ⚠️ **`date` は collect_funds.date と同じ規約**＝ JST 深夜 0 時の epoch（ミリ秒）。
 *    収益と同じ期間で突き合わせるので、片方だけ別の作り方をすると 1 日ずれる。
 *
 * ⚠️ **書き込みは必ず service client で行う。** 008 は SELECT のポリシーしか
 *    作っていない（利用者のクライアントで insert すると 42501 で失敗する）。
 */

/** カテゴリ。⚠️ アプリの src/components/expenses/categories.ts と同じ綴りにすること */
export const EXPENSE_CATEGORIES = [
  "仕入れ",
  "水道光熱費",
  "家賃",
  "修繕費",
  "消耗品費",
  "通信費",
  "広告宣伝費",
  "支払手数料",
  "その他",
];

const MAX_NAME_LENGTH = 40;
const MAX_NOTE_LENGTH = 200;

async function getMyMembership() {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) return { error: { msg: "組織に所属していません", status: 403 } };
  return { user, member };
}

/** 組織の店舗 ID。⚠️ 他組織の店舗に紐づけさせないための照合に使う */
async function getOrgStoreIds(orgId) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("laundry_store")
    .select("id")
    .eq("organization_id", orgId);
  return (data ?? []).map((s) => s.id);
}

/* ------------------------------------------------------------------ */
/* 月の計算                                                            */
/* ------------------------------------------------------------------ */

/** epoch（JST 深夜 0 時）→ "YYYY-MM"。⚠️ JST で読む（UTC で読むと月初が前月になる） */
const JST_OFFSET = 32_400_000;
function monthKeyFromEpoch(epoch) {
  const d = new Date(epoch + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM" → { year, month }（month は 1 始まり） */
function parseMonthKey(key) {
  const [y, m] = String(key).split("-");
  return { year: Number(y), month: Number(m) };
}

/** "YYYY-MM" の次の月 */
function nextMonthKey(key) {
  const { year, month } = parseMonthKey(key);
  return month === 12
    ? `${year + 1}-01`
    : `${year}-${String(month + 1).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* 単発の経費                                                          */
/* ------------------------------------------------------------------ */

function toApi(row) {
  return {
    id: row.id,
    laundryId: row.laundry_id ?? null,
    date: row.date,
    amount: row.amount,
    category: row.category,
    note: row.note ?? null,
    /** ⚠️ 展開した固定費と区別するための印。アプリはこれで編集可否を出し分ける */
    recurring: false,
  };
}

function validate({ date, amount, category, note }) {
  if (!Number.isFinite(date)) return "日付が不正です";
  if (!Number.isInteger(amount) || amount < 0) return "金額が不正です";
  if (!EXPENSE_CATEGORIES.includes(category)) return "カテゴリが不正です";
  if (note != null && String(note).length > MAX_NOTE_LENGTH) {
    return `メモは ${MAX_NOTE_LENGTH} 文字以内にしてください`;
  }
  return null;
}

/**
 * 期間の経費。**繰り返しの固定費も展開して混ぜて返す。**
 *
 * ⚠️ **必ず期間で切る。** 経費は増え続けるので、切らないと PostgREST の
 *    1000 行上限で古い順から黙って欠ける。
 *
 * @param startEpoch 含む / @param endEpoch **含む**（⚠️ /funds/chart の to は排他なので逆）
 */
export async function getExpenses(startEpoch, endEpoch, laundryId = null) {
  const { error, member } = await getMyMembership();
  if (error) return { error };

  const supabase = createServiceClient();

  /*
    ⚠️ **`fetchAllRows` には毎回**新しい**ビルダを返す関数を渡す。** 一度 await した
       ビルダは使い回せないので、ここで組み立てを関数にしている。
    ⚠️ 「組織全体（laundry_id が NULL）」は店舗で絞っても常に含める、では**ない**。
       店舗を指定したらその店舗のものだけを返す（全体の集計は指定なしで取る）。
  */
  const buildQuery = () => {
    let q = supabase
      .from("expenses")
      .select("id, laundry_id, date, amount, category, note")
      .eq("org_id", member.org_id)
      .gte("date", startEpoch)
      .lte("date", endEpoch)
      .order("date", { ascending: false });
    if (laundryId) q = q.eq("laundry_id", laundryId);
    return q;
  };

  const { data, error: queryError } = await fetchAllRows(buildQuery);

  if (queryError) return { error: "経費の取得に失敗しました" };

  const recurring = await expandRecurring(member.org_id, startEpoch, endEpoch, laundryId);
  if (recurring.error) return { error: recurring.error };

  // 新しい順。⚠️ 展開した固定費と実体を混ぜるので、ここで並べ直す必要がある
  const items = [...(data ?? []).map(toApi), ...recurring.items].sort(
    (a, b) => b.date - a.date
  );

  return { data: items };
}

export async function createExpense(input) {
  const { error, member, user } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "経費を登録する権限がありません", status: 403 } };
  }

  const message = validate(input);
  if (message) return { error: { msg: message, status: 400 } };

  if (input.laundryId) {
    const storeIds = await getOrgStoreIds(member.org_id);
    if (!storeIds.includes(input.laundryId)) {
      return { error: { msg: "指定された店舗へのアクセス権限がありません", status: 403 } };
    }
  }

  const supabase = createServiceClient();
  const { data, error: insertError } = await supabase
    .from("expenses")
    .insert({
      org_id: member.org_id,
      laundry_id: input.laundryId ?? null,
      date: input.date,
      amount: input.amount,
      category: input.category,
      note: input.note ?? null,
      created_by: user.id,
    })
    .select("id, laundry_id, date, amount, category, note")
    .single();

  if (insertError) return { error: "経費の登録に失敗しました" };
  return { data: toApi(data) };
}

export async function updateExpense(id, input) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "経費を編集する権限がありません", status: 403 } };
  }

  const message = validate(input);
  if (message) return { error: { msg: message, status: 400 } };

  if (input.laundryId) {
    const storeIds = await getOrgStoreIds(member.org_id);
    if (!storeIds.includes(input.laundryId)) {
      return { error: { msg: "指定された店舗へのアクセス権限がありません", status: 403 } };
    }
  }

  const supabase = createServiceClient();
  const { data, error: updateError } = await supabase
    .from("expenses")
    .update({
      laundry_id: input.laundryId ?? null,
      date: input.date,
      amount: input.amount,
      category: input.category,
      note: input.note ?? null,
    })
    // ⚠️ org_id を必ず条件に入れる。id だけだと他組織の行を書き換えられる
    .eq("id", id)
    .eq("org_id", member.org_id)
    .select("id, laundry_id, date, amount, category, note");

  if (updateError) return { error: "経費の更新に失敗しました" };
  if (!data || data.length === 0) {
    return { error: { msg: "経費が見つかりません", status: 404 } };
  }
  return { data: toApi(data[0]) };
}

export async function deleteExpense(id) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "経費を削除する権限がありません", status: 403 } };
  }

  const supabase = createServiceClient();
  const { data, error: deleteError } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("org_id", member.org_id)
    .select("id");

  if (deleteError) return { error: "経費の削除に失敗しました" };
  if (!data || data.length === 0) {
    return { error: { msg: "経費が見つかりません", status: 404 } };
  }
  return { data: { id } };
}

/* ------------------------------------------------------------------ */
/* 毎月の固定費                                                        */
/* ------------------------------------------------------------------ */

function toRecurringApi(row) {
  return {
    id: row.id,
    laundryId: row.laundry_id ?? null,
    name: row.name,
    amount: row.amount,
    category: row.category,
    dayOfMonth: row.day_of_month,
    startMonth: row.start_month,
    endMonth: row.end_month ?? null,
  };
}

/**
 * 固定費の定義を、期間内の各月へ**仮想的な経費**として展開する。
 *
 * ⚠️ **実体の行は作らない。** pg_cron で生成する案もあったが、004 の経路は
 *    失敗が 2 つのテーブルに分かれて記録されるほど追いにくく、
 *    経費が黙って欠ける／二重に入る事故のほうが高くつく。
 *
 * ⚠️ **展開した項目は編集・削除できない**（`id` が実在しない）。アプリは
 *    `recurring: true` を見て編集導線を出さないこと。
 *
 * ⚠️ **当月は `day_of_month` の到来前でも計上する**（発生主義）。
 *    「今月まだ 5 日だから家賃が入っていない」という状態を作らないため。
 *
 * ⚠️ **`day_of_month` は 28 まで**（008 の CHECK）。29 以上を許すと、
 *    その日が無い月で `getEpochTimeInSeconds` が翌月へ繰り上がって二重計上になる。
 */
async function expandRecurring(orgId, startEpoch, endEpoch, laundryId) {
  const supabase = createServiceClient();

  let query = supabase
    .from("recurring_expenses")
    .select("id, laundry_id, name, amount, category, day_of_month, start_month, end_month")
    .eq("org_id", orgId);
  if (laundryId) query = query.eq("laundry_id", laundryId);

  const { data, error } = await query;
  if (error) return { error: "固定費の取得に失敗しました" };

  const from = monthKeyFromEpoch(startEpoch);
  const to = monthKeyFromEpoch(endEpoch);
  const items = [];

  for (const row of data ?? []) {
    // 期間と定義の重なりだけを回す。⚠️ 文字列の比較で足りる（YYYY-MM は辞書順＝時系列）
    let month = row.start_month > from ? row.start_month : from;
    const last = row.end_month && row.end_month < to ? row.end_month : to;

    // ⚠️ 暴走よけ。5 年 = 60 か月なので余裕を持たせる
    for (let guard = 0; guard < 240 && month <= last; guard += 1) {
      const { year, month: m } = parseMonthKey(month);
      const date = getEpochTimeInSeconds(year, m, row.day_of_month);

      // ⚠️ 期間の端は日単位で切り直す。月で寄せただけだと範囲外の日が混ざる
      if (date >= startEpoch && date <= endEpoch) {
        items.push({
          // ⚠️ 実在しない id。アプリはこれで編集しようとしないこと
          id: `recurring:${row.id}:${month}`,
          laundryId: row.laundry_id ?? null,
          date,
          amount: row.amount,
          category: row.category,
          note: row.name,
          recurring: true,
          /** 元の定義。画面から「固定費の設定」へ飛ばすのに使う */
          recurringId: row.id,
        });
      }
      month = nextMonthKey(month);
    }
  }

  return { items };
}

export async function getRecurringExpenses() {
  const { error, member } = await getMyMembership();
  if (error) return { error };

  const supabase = createServiceClient();
  const { data, error: queryError } = await supabase
    .from("recurring_expenses")
    .select("id, laundry_id, name, amount, category, day_of_month, start_month, end_month")
    .eq("org_id", member.org_id)
    .order("start_month", { ascending: false })
    .order("created_at", { ascending: false });

  if (queryError) return { error: "固定費の取得に失敗しました" };
  return { data: (data ?? []).map(toRecurringApi) };
}

function validateRecurring(input) {
  if (!input?.name || String(input.name).trim() === "") return "名前を入力してください";
  if (String(input.name).length > MAX_NAME_LENGTH) {
    return `名前は ${MAX_NAME_LENGTH} 文字以内にしてください`;
  }
  if (!Number.isInteger(input.amount) || input.amount < 0) return "金額が不正です";
  if (!EXPENSE_CATEGORIES.includes(input.category)) return "カテゴリが不正です";
  if (!Number.isInteger(input.dayOfMonth) || input.dayOfMonth < 1 || input.dayOfMonth > 28) {
    // ⚠️ 29 以上を許すと、その日が無い月で計上が飛ぶ（DB の CHECK と同じ理由）
    return "日付は 1〜28 で指定してください";
  }
  if (!/^\d{4}-\d{2}$/.test(String(input.startMonth ?? ""))) return "開始月が不正です";
  if (input.endMonth != null && !/^\d{4}-\d{2}$/.test(String(input.endMonth))) {
    return "終了月が不正です";
  }
  if (input.endMonth != null && String(input.endMonth) < String(input.startMonth)) {
    return "終了月は開始月より後にしてください";
  }
  return null;
}

export async function createRecurringExpense(input) {
  const { error, member, user } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "固定費を登録する権限がありません", status: 403 } };
  }

  const message = validateRecurring(input);
  if (message) return { error: { msg: message, status: 400 } };

  if (input.laundryId) {
    const storeIds = await getOrgStoreIds(member.org_id);
    if (!storeIds.includes(input.laundryId)) {
      return { error: { msg: "指定された店舗へのアクセス権限がありません", status: 403 } };
    }
  }

  const supabase = createServiceClient();
  const { data, error: insertError } = await supabase
    .from("recurring_expenses")
    .insert({
      org_id: member.org_id,
      laundry_id: input.laundryId ?? null,
      name: String(input.name).trim(),
      amount: input.amount,
      category: input.category,
      day_of_month: input.dayOfMonth,
      start_month: input.startMonth,
      end_month: input.endMonth ?? null,
      created_by: user.id,
    })
    .select("id, laundry_id, name, amount, category, day_of_month, start_month, end_month")
    .single();

  if (insertError) return { error: "固定費の登録に失敗しました" };
  return { data: toRecurringApi(data) };
}

/**
 * 固定費の更新。
 *
 * ⚠️ **金額を変えると過去の月まで遡って変わる。** 展開は定義から毎回計算するため。
 *    「今月から家賃が上がった」を表したいときは、**既存の定義に end_month を入れて
 *    終わらせ、新しい定義を作る。** 画面でもそう案内すること。
 */
export async function updateRecurringExpense(id, input) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "固定費を編集する権限がありません", status: 403 } };
  }

  const message = validateRecurring(input);
  if (message) return { error: { msg: message, status: 400 } };

  if (input.laundryId) {
    const storeIds = await getOrgStoreIds(member.org_id);
    if (!storeIds.includes(input.laundryId)) {
      return { error: { msg: "指定された店舗へのアクセス権限がありません", status: 403 } };
    }
  }

  const supabase = createServiceClient();
  const { data, error: updateError } = await supabase
    .from("recurring_expenses")
    .update({
      laundry_id: input.laundryId ?? null,
      name: String(input.name).trim(),
      amount: input.amount,
      category: input.category,
      day_of_month: input.dayOfMonth,
      start_month: input.startMonth,
      end_month: input.endMonth ?? null,
    })
    .eq("id", id)
    .eq("org_id", member.org_id)
    .select("id, laundry_id, name, amount, category, day_of_month, start_month, end_month");

  if (updateError) return { error: "固定費の更新に失敗しました" };
  if (!data || data.length === 0) {
    return { error: { msg: "固定費が見つかりません", status: 404 } };
  }
  return { data: toRecurringApi(data[0]) };
}

/**
 * 固定費の削除。
 *
 * ⚠️ **過去の月からも消える**（展開は定義から毎回計算するため）。
 *    「これまでの分は残したい」なら削除ではなく end_month を入れること。画面で案内する。
 */
export async function deleteRecurringExpense(id) {
  const { error, member } = await getMyMembership();
  if (error) return { error };
  if (member.role === "viewer") {
    return { error: { msg: "固定費を削除する権限がありません", status: 403 } };
  }

  const supabase = createServiceClient();
  const { data, error: deleteError } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id)
    .eq("org_id", member.org_id)
    .select("id, name");

  if (deleteError) return { error: "固定費の削除に失敗しました" };
  if (!data || data.length === 0) {
    return { error: { msg: "固定費が見つかりません", status: 404 } };
  }
  return { data: data[0] };
}
