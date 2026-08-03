/**
 * 経費を担当店舗（011）で絞るときの判定。
 *
 * ⚠️ **`expenses/action.js` に置けない。** `"use server"` のモジュールは
 *    **async 関数しか export できず**、同期の関数を置くと
 *    **Vercel のビルドが落ちる**（`Failed to collect page data for …` としか出ない）。
 *    `plans.js` / `expenseCategories.js` と同じ理由でここに置いてある。
 *
 * ⚠️ **`storeIds === null` が「全店舗」**（admin）。**空配列とは意味が違う。**
 *    `storeIds?.length` のような書き方で判定しないこと。
 *
 * ⚠️ **組織全体（`laundry_id` が NULL）は誰にも残す。** 店舗の経費ではないので
 *    「担当していない店舗」に当たらない。落とすと、税理士費用のような
 *    組織の支出が admin 以外には一切見えなくなる。
 */

/** uuid かどうか。⚠️ `.or()` は値を文字列に埋め込むので、通す前に確かめる */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PostgREST に渡す絞り込みの形を決める。
 *
 * @returns
 *   `{ kind: "all" }`      … 絞らない（admin）
 *   `{ kind: "orgOnly" }`  … `laundry_id IS NULL` だけ（担当 0 件）
 *   `{ kind: "or", filter }` … `laundry_id IS NULL OR laundry_id IN (…)`
 */
export function expenseScopeFilter(storeIds) {
  if (storeIds === null || storeIds === undefined) return { kind: "all" };

  const ids = (Array.isArray(storeIds) ? storeIds : []).filter((id) => UUID.test(String(id)));
  /*
    ⚠️ **担当が 0 件なら組織全体だけ。** `in.()` は空だと構文エラーになるので、
       ここで必ず分岐する（不正な id しか無いときも同じ扱い）。
  */
  if (ids.length === 0) return { kind: "orgOnly" };

  return { kind: "or", filter: `laundry_id.is.null,laundry_id.in.(${ids.join(",")})` };
}

/**
 * その店舗を扱ってよいか。
 *
 * ⚠️ **`null` / `undefined`（組織全体）は常に可。** 店舗ではないため。
 */
export function inExpenseStoreScope(storeIds, laundryId) {
  if (!laundryId) return true;
  if (storeIds === null || storeIds === undefined) return true;
  return (Array.isArray(storeIds) ? storeIds : []).includes(laundryId);
}

/* ------------------------------------------------------------------ */
/* 誰がどれを直せるか                                                   */
/* ------------------------------------------------------------------ */

const JST_OFFSET = 32_400_000;

/**
 * epoch → JST の "YYYY-MM"。
 *
 * ⚠️ **`expenses.date`（JST 深夜 0 時の epoch）にも `Date.now()`（実時刻）にも
 *    同じ式が使える。** どちらも「9 時間足して UTC として読む」で JST の
 *    暦日になるため。⚠️ **UTC のまま読むと月初が前月になる。**
 */
export function jstMonthKey(epoch) {
  const d = new Date(Number(epoch) + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** その日付が JST の当月か */
export function isCurrentJstMonth(epoch, now = Date.now()) {
  return Number.isFinite(Number(epoch)) && jstMonthKey(epoch) === jstMonthKey(now);
}

/**
 * 単発の経費を**直してよいか**（2026-08-03）。
 *
 * | | |
 * |---|---|
 * | admin | 全部 |
 * | 集金担当者 | **自分が登録した、当月の分だけ** |
 * | 閲覧者 | 不可 |
 *
 * ⚠️ **「登録できるのに直せない」を埋めるための緩和で、権限を戻したのではない。**
 *    当月に限るのは、締めた過去の月の数字が後から動くのを防ぐため。
 *
 * ⚠️ **`created_by` が null の行は直せない**（008 は `ON DELETE SET NULL` なので、
 *    登録した人が退会すると null になる）。**閉じるほうへ倒す。**
 *
 * ⚠️ **サーバとアプリで二重に判定しない。** 応答の `editable` に畳んで返し、
 *    画面はそれを見るだけにする（同じ規則を 2 リポジトリに置くと必ずずれる）。
 */
export function canEditExpense(role, userId, row, now = Date.now()) {
  if (role === "admin") return true;
  if (role !== "collecter") return false;
  if (!userId || !row?.created_by || row.created_by !== userId) return false;
  return isCurrentJstMonth(row.date, now);
}
