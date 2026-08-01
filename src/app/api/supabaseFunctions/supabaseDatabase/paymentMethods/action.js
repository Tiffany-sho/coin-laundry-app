"use server";

import { createServiceClient } from "@/utils/supabase/service";

/**
 * 店舗ごとの支払方法（PayPay・クレジットカードなど）。
 *
 * ⚠️ **009 で「組織ごと」から「店舗ごと」に変わった。** 登録・編集の口も
 *    設定画面から**店舗フォームの中**へ移っている（`createStore` / `updateStore`
 *    が `paymentMethods` を受け取って、このモジュールの `reconcile…` を呼ぶ）。
 *    ⚠️ **独立した CRUD の口を作り直さないこと。** 店舗の保存と別々に書けると、
 *    店舗フォームの「保存しないで戻る」で支払方法だけ残る。
 *
 * ⚠️ **現金はこのテーブルに入れない。** 常に存在する暗黙の方法として扱い、
 *    現金額は `collect_funds.totalFunds − sum(cashless[].amount)` で出す。
 *    行として持つと「現金を無効化できてしまう」「二重に数える」の両方が起きる。
 *
 * ⚠️ **書き込みは必ず service client で行う。** 007 / 009 は payment_methods に
 *    SELECT のポリシーしか作っていない。利用者のクライアントで insert すると
 *    42501 で静かに失敗する。
 */

/**
 * DB の列名（snake_case）をアプリ向けに揃える。
 *
 * ⚠️ **必ずここを通すこと。** 生の行をそのまま返すと `sort_order` / `is_active` の
 *    まま端末へ届き、アプリ側の `sortOrder` / `isActive` が **undefined** になる。
 *    型は合っているように見えるので TypeScript は何も言わず、
 *    「並び順がばらばら」「無効にしたものが集金画面に出続ける」形で気づくことになる。
 */
function toApi(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active !== false,
  };
}

/** 名前の長さの上限。⚠️ 集金画面の入力欄に並ぶので長すぎると折り返す */
const MAX_NAME_LENGTH = 20;

/** 1 店舗あたりの上限。⚠️ 集金画面に縦に並ぶので、増えるほど入力が重くなる */
const MAX_METHODS = 10;

const nameOf = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * 店舗の一覧に支払方法を貼り付ける（`getStores` / `getStore` から呼ぶ）。
 *
 * ⚠️ **店舗 1 件ごとに問い合わせない。** 店舗数ぶん往復すると一覧が遅くなる。
 *    まとめて 1 回引いて laundry_id で束ねる。
 *
 * ⚠️ **無効にしたもの（`is_active = false`）も返す。** 店舗フォームで戻せる
 *    ようにするため。**集金画面は必ず `isActive` で絞ること。**
 */
export async function attachPaymentMethods(stores) {
  const rows = Array.isArray(stores) ? stores : [];
  if (rows.length === 0) return rows;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, laundry_id, name, sort_order, is_active")
    .in(
      "laundry_id",
      rows.map((s) => s.id)
    )
    // ⚠️ 並び順に一意な列を足す。sort_order は重複し得るので、それだけだと
    //    取得のたびに順番が変わって画面がちらつく
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  /*
    ⚠️ **失敗しても店舗一覧ごと落とさない。** 支払方法が出ないより、
       店舗が 1 件も出ないほうが困る。空配列を配って続ける。
  */
  const byStore = new Map();
  if (!error) {
    for (const row of data ?? []) {
      const key = String(row.laundry_id);
      if (!byStore.has(key)) byStore.set(key, []);
      byStore.get(key).push(toApi(row));
    }
  }

  return rows.map((store) => ({
    ...store,
    paymentMethods: byStore.get(String(store.id)) ?? [],
  }));
}

/**
 * 店舗の保存に合わせて支払方法を揃える。
 *
 * 受け取るのは `[{ id?, name, isActive? }]`。⚠️ **`undefined` は「据え置き」。**
 * 空配列（`[]`）は「全部無効にする」の意味なので、混同しないこと
 * （`cashless` と同じ規約。Web の店舗フォームは支払方法を知らないまま
 * 保存してくるので、据え置きにしないと**Web で店舗を編集した瞬間に
 * 支払方法が全部消える**）。
 *
 * ⚠️ **一覧から外れたものを物理削除しない。** 過去の `collect_funds.cashless` が
 *    参照している。`is_active = false` にするだけ。
 *
 * ⚠️ **戻り値は使わない設計にしてある。** 失敗しても店舗の保存自体は成功と
 *    するため、呼び出し側は `error` を見て文言を足すだけにすること。
 */
export async function reconcileStorePaymentMethods(laundryId, orgId, input) {
  if (input === undefined || input === null) return { data: null };
  if (!Array.isArray(input)) {
    return { error: { msg: "支払方法の形式が不正です", status: 400 } };
  }
  if (input.length > MAX_METHODS) {
    return { error: { msg: `支払方法は ${MAX_METHODS} 件までです`, status: 400 } };
  }

  /* ── 送られてきた内容を先に検証する（DB を触る前に全部弾く） ── */
  const wanted = [];
  const seen = new Set();
  for (const raw of input) {
    const name = nameOf(raw?.name);
    if (!name) return { error: { msg: "支払方法の名前を入力してください", status: 400 } };
    if (name.length > MAX_NAME_LENGTH) {
      return { error: { msg: `名前は ${MAX_NAME_LENGTH} 文字以内にしてください`, status: 400 } };
    }
    /*
      ⚠️ 「現金」という名前を作らせない。現金は暗黙の方法として別枠で数えているので、
         同名の行を作ると集金画面に「現金」が 2 つ並び、片方は総額に二重計上される。
    */
    if (name === "現金") {
      return { error: { msg: "「現金」は既定で記録されるため追加できません", status: 400 } };
    }
    // ⚠️ 同じ名前を 2 つ送られると UNIQUE(laundry_id, name) で 23505 になる。
    //    エラー文言を分かりやすくするため手前で弾く
    if (seen.has(name)) {
      return { error: { msg: `「${name}」が重複しています`, status: 400 } };
    }
    seen.add(name);
    wanted.push({ name, isActive: raw?.isActive !== false });
  }

  const supabase = createServiceClient();
  const { data: existing, error: readError } = await supabase
    .from("payment_methods")
    .select("id, name, is_active")
    .eq("laundry_id", laundryId);

  if (readError) return { error: "支払方法の取得に失敗しました" };

  /*
    ⚠️ **突き合わせは名前で行う。** クライアントが送ってくる id を信じて
       更新すると、他店舗の行の id を送られたときに書き換えられる。
       名前で引き直せば laundry_id の条件から外れようがない。
  */
  const byName = new Map((existing ?? []).map((row) => [nameOf(row.name), row]));

  const inserts = [];
  const updates = [];

  wanted.forEach((entry, index) => {
    const current = byName.get(entry.name);
    if (!current) {
      inserts.push({
        org_id: orgId,
        laundry_id: laundryId,
        name: entry.name,
        sort_order: index,
        is_active: entry.isActive,
      });
      return;
    }
    byName.delete(entry.name);
    updates.push({ id: current.id, sort_order: index, is_active: entry.isActive });
  });

  // 一覧から消えたもの ＝ 無効化する（⚠️ 物理削除しない）
  for (const row of byName.values()) {
    if (row.is_active === false) continue;
    updates.push({ id: row.id, is_active: false });
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("payment_methods").insert(inserts);
    // 23505 = UNIQUE(laundry_id, name)。上で重複を弾いているので通常は来ない
    if (error?.code === "23505") {
      return { error: { msg: "同じ名前の支払方法がすでにあります", status: 400 } };
    }
    if (error) return { error: "支払方法の追加に失敗しました" };
  }

  for (const patch of updates) {
    const { id, ...rest } = patch;
    const { error } = await supabase
      .from("payment_methods")
      .update(rest)
      .eq("id", id)
      // ⚠️ laundry_id を必ず条件に入れる。id だけだと他店舗の行を書き換えられる
      .eq("laundry_id", laundryId);
    if (error) return { error: "支払方法の更新に失敗しました" };
  }

  return { data: null };
}
