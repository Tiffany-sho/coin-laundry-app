"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { changeEpocFromNowYearMonth, getEpochTimeInSeconds } from "@/functions/makeDate/date";
import { applyDateRange, END_INCLUSIVE } from "@/functions/dateRange";
import { fetchAllRows } from "@/functions/fetchAllRows";
import { getStores } from "../laundryStore/action";

async function getOrgStoreIds() {
  const { data: stores, error } = await getStores();
  if (error || !stores) return [];
  return stores.map((s) => s.id);
}

export async function hasStoreFunds(id) {
  const { user } = await getUser();
  if (!user) return { has: false };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { has: false };

  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("collect_funds")
    .select("id", { count: "exact", head: true })
    .eq("laundryId", id);

  if (error) return { has: false };
  return { has: (count ?? 0) > 0 };
}

export const getFundsData = async (id) => {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: { msg: "アクセス権限がありません", status: 403 } };

  const supabase = createServiceClient();
  const { data: initialData, error: initialError } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("laundryId", id);

  if (initialError) return { error: initialError };
  return { data: initialData };
};

// 店舗のチャート用全集金データ取得（期間フィルタ付き、RLS回避）
export async function getStoreFundsForChart(id, startEpoch, endEpoch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  // startEpoch は月初、endEpoch は翌月初（期間スライダー由来）
  // ⚠️ 期間は最大 5 年選べるので 1000 行の上限に届く。fetchAllRows を通すこと
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("date, totalFunds, laundryId")
        .eq("laundryId", id)
        .order("date", { ascending: true }),
      startEpoch,
      endEpoch
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

/** 硬貨 1 枚あたりの金額。⚠️ アプリの src/shared/collectMoney.ts と同じ値にすること */
const COIN_VALUE = 100;

/**
 * 機器ごとの売上内訳（店舗別ページの「機器別」タブ）。
 *
 * ⚠️ **生レコードを返さない。** fundsArray は台数ぶんの jsonb なので、5 年ぶんを
 *    そのまま端末へ流すと応答が数 MB になる。**ここで畳んでから返すこと。**
 *
 * ⚠️ **合計は必ず「機器別の和 + unattributed」で店舗の総額に一致させる。**
 *    合計入力モードで登録された集金は fundsArray が**空配列**なので
 *    （app/collect/[storeId].tsx が `byMachine ? rows.map(...) : []` を送る）、
 *    機器別だけを足すと総額収益カードより小さくなる。**差分を黙って捨てない。**
 *
 * ⚠️ **期間は最大 5 年選べるので 1000 行の上限に届く。** fetchAllRows を通すこと。
 */
export async function getStoreMachineBreakdown(id, startEpoch, endEpoch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const { data: stores, error: storeError } = await getStores();
  if (storeError) return { error: "店舗情報の取得に失敗しました" };

  const store = (stores ?? []).find((s) => s.id === id);
  // 組織の店舗一覧に無い ＝ 他組織の店舗。存在の有無は明かさない
  if (!store) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("date, totalFunds, fundsArray")
        .eq("laundryId", id)
        .order("date", { ascending: true }),
      startEpoch,
      endEpoch
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };

  /**
   * 表示名は**現在の設備一覧を優先**する。改名しても過去の集計が古い名前で
   * 並ばないようにするため。設備が消えていればレコードに残っている名前へ落とす。
   */
  const currentNames = new Map(
    (store.machines ?? []).filter((m) => m?.id).map((m) => [String(m.id), m.name])
  );

  /** id → { name, total }。⚠️ 現在ある設備は売上 0 でも並べる（故障中の台に気づけるように） */
  const byMachine = new Map();
  for (const [machineId, name] of currentNames) {
    byMachine.set(machineId, { id: machineId, name, total: 0 });
  }

  let totalModeAmount = 0;
  let machinesTotal = 0;
  let grandTotal = 0;

  for (const row of data ?? []) {
    const amount = row.totalFunds ?? 0;
    grandTotal += amount;

    const entries = Array.isArray(row.fundsArray) ? row.fundsArray : [];
    if (entries.length === 0) {
      // 合計入力モード。機器に割り振れないので内訳の外に出す
      totalModeAmount += amount;
      continue;
    }

    for (const entry of entries) {
      const key = entry?.id != null ? String(entry.id) : `name:${entry?.name ?? ""}`;
      let current = byMachine.get(key);
      if (!current) {
        current = { id: key, name: entry?.name ?? "（削除された設備）", total: 0 };
        byMachine.set(key, current);
      }
      // ⚠️ funds は硬貨の枚数。金額にするには × 100
      const value = (entry?.funds ?? 0) * COIN_VALUE;
      current.total += value;
      machinesTotal += value;
    }
  }

  const machines = [...byMachine.values()].sort((a, b) => b.total - a.total);

  /**
   * ⚠️ **残差を必ず出す。** 内訳の和が総額に届かない可能性が 2 つある。
   *
   *   1. キャッシュレス（007 以降）… totalFunds に含まれるが機器には紐づかない
   *   2. 過去データのずれ … `totalFunds` と `fundsArray` は別々の列で、
   *      DB 側に「和が一致する」制約は無い。Web 側の編集経路が両方を
   *      送り直す作りなので、片方だけ書き換わった行が過去に生まれ得る
   *
   * これを捨てると **「機器別の合計が総額収益カードと違う」** という形でしか
   * 気づけない（しかも原因が分からない）。0 のときは画面に出さない。
   */
  const other = grandTotal - machinesTotal - totalModeAmount;

  return {
    data: {
      machines,
      unattributed: {
        /** 合計入力モードで登録されたぶん */
        totalMode: totalModeAmount,
        /**
         * 機器にも合計入力にも紐づかないぶん。
         * ⚠️ 007 を適用したら、ここから **キャッシュレスぶんを切り出して別項目にする**こと
         *    （今は両方まとめてここに入る）。切り出しても `other` は残すこと。
         * ⚠️ 負になり得る（fundsArray の和が totalFunds を上回る古い行）。丸めないこと
         */
        other,
      },
      /** ⚠️ machines の和 + unattributed の和 と必ず一致する（定義上そうなる） */
      total: grandTotal,
    },
  };
}

// 店舗の集金データ取得（全期間・ページネーション付き、RLS回避）
// 管理者・集金担当者・閲覧者全員が参照可能
export async function getStoreFundsPaginated(id, orderAmount, upOrder, from, to) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
    .eq("laundryId", id)
    .order(orderAmount, { ascending: upOrder })
    .range(from, to);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 店舗の集金データ取得（期間指定・全件、RLS回避）
export async function getStoreFundsInPeriod(id, startEpoch, endEpoch, orderAmount, upOrder) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(id)) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  // ⚠️ 期間の下限が無い呼び出し（アプリの売上履歴）があるので必ず全件取る
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
        .eq("laundryId", id)
        .order(orderAmount, { ascending: upOrder }),
      startEpoch,
      endEpoch
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org全体の集金データ取得（期間指定・全件、RLS回避）
export async function getOrgCollectFundsInPeriod(startEpoch, endEpoch, orderAmount, upOrder) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  // ⚠️ アプリの売上履歴は from=0 / to 省略（＝全期間）で呼ぶ。必ず全件取る
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
        .in("laundryId", storeIds)
        .order(orderAmount, { ascending: upOrder }),
      startEpoch,
      endEpoch
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 単一集金レコードのfundsArrayをon-demand取得
export async function getFundItemById(id) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { error: "アクセス権限がありません" };

  const supabase = createServiceClient();
  /**
   * ⚠️ `laundryName` も引く。アクションログの文面（「〇〇店の集金データを
   *    削除しました」）に使う。**削除後には引けないので、消す前にここで取る。**
   *    追加しただけなので既存の呼び出し（明細の遅延取得）には影響しない。
   */
  const { data, error } = await supabase
    .from("collect_funds")
    .select("fundsArray, laundryName")
    .eq("id", id)
    .in("laundryId", storeIds)
    .single();

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

export async function createData(formData) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: "集金データを登録する権限がありません" };
  }

  const storeIds = await getOrgStoreIds();
  if (!storeIds.includes(formData.storeId)) {
    return { error: "指定された店舗へのアクセス権限がありません" };
  }

  const serviceSupabase = createServiceClient();

  const row = {
    laundryId: formData.storeId,
    laundryName: formData.store,
    date: formData.date,
    fundsArray: formData.fundsArray,
    totalFunds: formData.totalFunds,
    collecter: user.id,
  };

  // モバイルのみ冪等性キーを送ってくる。Web は未指定なので NULL のまま（部分ユニークの対象外）
  if (formData.clientRequestId) row.client_request_id = formData.clientRequestId;

  const { data, error } = await serviceSupabase
    .from("collect_funds")
    .insert(row)
    .select("id,laundryId,laundryName")
    .single();

  if (error) {
    // 23505 = 一意制約違反。オフライン再送で同じキーが 2 回届いた場合なので
    // エラーにせず、既に入っているレコードを返して成功扱いにする（二重計上の防止）
    if (error.code === "23505" && formData.clientRequestId) {
      const { data: existing } = await serviceSupabase
        .from("collect_funds")
        .select("id,laundryId,laundryName")
        .eq("client_request_id", formData.clientRequestId)
        .single();

      if (existing) return { data: existing, duplicated: true };
    }
    return { error: "集金データの登録に失敗しました" };
  }
  return { data };
}

export async function updateData(fundsArray, totalFunds, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを編集する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let query = serviceSupabase
    .from("collect_funds")
    .update({ fundsArray, totalFunds })
    .eq("id", id)
    .select("id");
  if (member.role !== "admin") {
    query = query.eq("collecter", user.id);
  }

  const { data, error } = await query;
  /**
   * ⚠️ **`changed` を見ないと「更新できていない」ことに気づけない。**
   *    非 admin が他人の集金データを編集すると `collecter` の条件で
   *    0 行になるが、エラーにはならず 200 が返る（docs/contracts.md の
   *    「既知の未対応」）。呼び出し側が成功と誤認しないよう件数を返す。
   */
  return { error, changed: data?.length ?? 0 };
}

export async function updateDate(date, id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを編集する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let dateQuery = serviceSupabase
    .from("collect_funds")
    .update({ date })
    .eq("id", id);
  if (member.role !== "admin") {
    dateQuery = dateQuery.eq("collecter", user.id);
  }
  const { data, error } = await dateQuery.select("date").single();

  if (error) return { error };
  return { data };
}

export async function deleteData(id) {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!member || member.role === "viewer") {
    return { error: { msg: "集金データを削除する権限がありません", status: 403 } };
  }

  const storeIds = await getOrgStoreIds();
  const serviceSupabase = createServiceClient();

  const { data: target } = await serviceSupabase
    .from("collect_funds")
    .select("laundryId")
    .eq("id", id)
    .single();

  if (!target || !storeIds.includes(target.laundryId)) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  let query = serviceSupabase.from("collect_funds").delete().eq("id", id).select("id");
  if (member.role !== "admin") {
    query = query.eq("collecter", user.id);
  }

  const { data, error } = await query;
  // ⚠️ updateData と同じ。非 admin が他人のデータを消そうとすると 0 行で成功扱いになる
  return { error, changed: data?.length ?? 0 };
}

export async function getAllMonthBenefits() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocYearBeforeMonth = changeEpocFromNowYearMonth(-1);
  const epocYearAfterMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await applyDateRange(
    supabase
      .from("collect_funds")
      .select("date,totalFunds,laundryId")
      .in("laundryId", storeIds),
    epocYearBeforeMonth,
    epocYearAfterMonth
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の集金データ一覧（RLS回避：サービスクライアント使用）
export async function getOrgCollectFunds(startEpoch, endEpoch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  // startEpoch は月初、endEpoch は翌月初（期間スライダー由来）
  // ⚠️ 期間は最大 5 年選べるので 1000 行の上限に届く
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("date, totalFunds, laundryId, laundryName")
        .in("laundryId", storeIds)
        .order("date", { ascending: true }),
      startEpoch,
      endEpoch
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

/**
 * ホーム用：org 全体の「過去 1 か月」。
 *
 * ⚠️ **下限を Date.now() から引いて作らないこと。** collect_funds.date は
 *    **JST 深夜 0 時の epoch**（Date.UTC(y,m,d) - 9h）なので、UTC の「今この瞬間」から
 *    30 日引くと境界が JST の 1 日の途中に落ち、境目の日が丸ごと欠ける。
 *    JST の今日を求めてから、その 1 か月前の 0 時を下限にする。
 *
 * ⚠️ 件数の上限（MAX）は表示件数ではない。表示側で何件出すかはアプリ・Web が決める。
 *    ここを 30 のような小さい値にすると、集金が多い組織では
 *    「過去 1 か月」と書いてあるのに半月ぶんしか届かなくなる（実際にそうなっていた）。
 */
const RECENT_MAX = 200;

export async function getRecentCollectFunds() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  // JST の壁時計。Vercel は UTC で動くので +9h して UTC ゲッタで読む
  const jstNow = new Date(Date.now() + 32400000);
  // ⚠️ 3/31 のように「前月に無い日」は Date.UTC が繰り上げる（2/31 → 3/3）。
  //    窓が数日短くなるだけで 1 か月を超えることはないので、そのまま使う
  const startEpoch = getEpochTimeInSeconds(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(), // 実際の月は getUTCMonth() + 1。その 1 つ前の月を渡している
    jstNow.getUTCDate()
  );

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("id, laundryName, date, totalFunds, profiles!collect_funds_collecter_fkey(username)")
    .in("laundryId", storeIds)
    .gte("date", startEpoch)
    .order("date", { ascending: false })
    .limit(RECENT_MAX);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の集金データ（過去2か月・ページネーション付き）
export async function getOrgCollectFundsPaginated(orderAmount, upOrder, from, to) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const startEpoch = changeEpocFromNowYearMonth(-2);

  const supabase = createServiceClient();
  const { data, error } = await applyDateRange(
    supabase
      .from("collect_funds")
      .select("id, laundryId, laundryName, date, totalFunds, collecter, profiles!collect_funds_collecter_fkey(username)")
      .in("laundryId", storeIds),
    startEpoch,
    null
  )
    .order(orderAmount, { ascending: upOrder })
    .range(from, to);

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// CSV エクスポート用：org 全体の集金データ全件（ページネーションなし）
// filterStoreIds: 指定した場合、org store IDs との積集合で絞り込む（セキュリティ保証）
export async function getCollectFundsForExport(startEpoch, endEpoch, filterStoreIds = null) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  const effectiveStoreIds = filterStoreIds
    ? orgStoreIds.filter((id) => filterStoreIds.includes(id))
    : orgStoreIds;
  if (effectiveStoreIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  // エクスポート画面の startEpoch / endEpoch は「選択した開始日・終了日」そのもの。
  // 終了日当日のデータも出力に含める必要があるため endMode は inclusive。
  // ⚠️ CSV は取りこぼしが一番分かりにくい（開いても「そういう期間だった」と読める）ので
  //    必ず全件取る
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("date, totalFunds, laundryName, fundsArray, profiles!collect_funds_collecter_fkey(username)")
        .in("laundryId", effectiveStoreIds)
        .order("date", { ascending: true }),
      startEpoch,
      endEpoch,
      { endMode: END_INCLUSIVE }
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の当月集金合計（ホーム画面用）
export async function getMonthFunds() {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocYearMonth = changeEpocFromNowYearMonth(0);
  const epocYearNextMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await applyDateRange(
    supabase.from("collect_funds").select("totalFunds").in("laundryId", storeIds),
    epocYearMonth,
    epocYearNextMonth
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 月次サマリー用：過去2年分の date, totalFunds のみ取得（fundsArray 除外で軽量）
// storeId 指定時はその店舗のみ、null の場合は org 全体
export async function getCollectMonthlySummary(storeId = null) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  let targetIds;
  if (storeId) {
    if (!orgStoreIds.includes(storeId)) return { error: "アクセス権限がありません" };
    targetIds = [storeId];
  } else {
    targetIds = orgStoreIds;
  }

  // 前年同月比のため過去2年分を取得。
  // レコードは深夜0時ちょうどなので、cutoff にも時刻を残すとその月の1日が欠ける。
  // 月初0時ちょうどに正規化してから範囲に含める。
  const now = new Date();
  const cutoffEpoch = getEpochTimeInSeconds(now.getFullYear() - 2, now.getMonth() + 1, 1);

  const supabase = createServiceClient();
  // ⚠️ 2 年ぶんなので 1000 行の上限に届く。届いた瞬間、古い月がグラフから消えるのではなく
  //    **新しい月の合計が減る**（並び順が id なので）ため、原因が分かりにくい
  const { data, error } = await fetchAllRows(() =>
    applyDateRange(
      supabase
        .from("collect_funds")
        .select("date, totalFunds, laundryId")
        .in("laundryId", targetIds),
      cutoffEpoch,
      null
    )
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// 全期間の店舗別売上合計用：totalFunds, laundryName, laundryId を全件取得（fundsArray 除外）
export async function getStoreRevenueSummary() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const orgStoreIds = await getOrgStoreIds();
  if (orgStoreIds.length === 0) return { data: [] };

  const supabase = createServiceClient();
  /**
   * ⚠️ **全期間なので 1000 行の上限に真っ先に届く。** ここが打ち切られると
   *    総額収益が黙って実際より少なくなる（エラーも警告も出ない）。
   * ⚠️ date を落とさないこと。集計期間の「最初 / 最後の集金日」はここからしか出せない
   *    （月次サマリーは前年同月比のため過去 2 年に固定されている）。
   */
  const { data, error } = await fetchAllRows(() =>
    supabase
      .from("collect_funds")
      .select("totalFunds, laundryName, laundryId, date")
      .in("laundryId", orgStoreIds)
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}

// org 全体の指定月集金合計（ホーム画面グラフ用）
export async function getMonthFundsByOffset(monthOffset) {
  const storeIds = await getOrgStoreIds();
  if (storeIds.length === 0) return { data: [] };

  const supabase = await createClient();
  const epocStart = changeEpocFromNowYearMonth(monthOffset);
  const epocEnd = changeEpocFromNowYearMonth(monthOffset + 1);

  const { data, error } = await applyDateRange(
    supabase.from("collect_funds").select("totalFunds").in("laundryId", storeIds),
    epocStart,
    epocEnd
  );

  if (error) return { error: "集金データの取得に失敗しました" };
  return { data };
}
