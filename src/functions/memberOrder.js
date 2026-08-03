/**
 * 組織のメンバーの並び順。**管理者 → 集金担当者 → 閲覧者。**
 *
 * ⚠️ **`organization/action.js` に置けない。** `"use server"` のモジュールは
 *    **async 関数しか export できず**、定数を置くと Vercel のビルドが落ちる
 *    （`Failed to collect page data for …` としか出ない）。
 *
 * ⚠️ **並べるのはサーバ側 1 か所。** Web の組織設定とアプリの組織ページが
 *    同じ `getOrganizationMembers` を見ているので、ここで並べれば両方に効く。
 *    **画面ごとに並べ直さないこと**（片方だけ直すと順番が食い違う）。
 */

/**
 * ⚠️ **綴りは `collecter`。`collector` ではない**（`docs/contracts.md` の「文字列の値」）。
 *    間違えると型エラーも出ないまま、集金担当者が末尾に落ちる。
 *
 * ⚠️ **知らないロールは末尾**（`UNKNOWN_RANK`）。0 にすると、将来ロールを足したときに
 *    **管理者より上へ黙って割り込む。**
 */
export const MEMBER_ROLE_RANK = Object.freeze({
  admin: 0,
  collecter: 1,
  viewer: 2,
});

const UNKNOWN_RANK = 99;

export function memberRoleRank(role) {
  return MEMBER_ROLE_RANK[role] ?? UNKNOWN_RANK;
}

/**
 * 並び替えの比較関数。ロール → 参加が早い順 → 表示名。
 *
 * ⚠️ **同順位の中まで決めきること。** ロールだけで比べると、同じロールの人の
 *    順番が取得のたびに入れ替わり得る（PostgREST は `ORDER BY` の無い
 *    問い合わせの順序を保証しない）。**画面がちらついて見える。**
 *
 * ⚠️ **`joined_at` が無い行がある**（古い行・RPC が返さない場合）。
 *    そのときは名前だけで比べる。**`undefined` を `new Date()` に通さないこと**
 *    （`NaN` になり、比較が常に false で並びが崩れる）。
 */
export function compareMembers(a, b) {
  const byRole = memberRoleRank(a?.role) - memberRoleRank(b?.role);
  if (byRole !== 0) return byRole;

  const at = Date.parse(a?.joined_at ?? "");
  const bt = Date.parse(b?.joined_at ?? "");
  if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return at - bt;

  // ⚠️ 日本語を含むので localeCompare。素の < > だと五十音順にならない
  const an = String(a?.profiles?.username ?? "");
  const bn = String(b?.profiles?.username ?? "");
  return an.localeCompare(bn, "ja");
}

/** ⚠️ 元の配列を壊さない（呼び出し側がそのまま使っていることがある） */
export function sortMembers(members) {
  return [...(members ?? [])].sort(compareMembers);
}
