import { getExpenses } from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";

/**
 * 書き出しに載せる経費を取ってくる。
 *
 * ⚠️ **`/api/export/*`（Web）と `/api/v1/funds/export`（アプリ）の両方から使う。**
 *    同じ絞り方を 2 か所に書くと、**Web とアプリで書き出しの中身が違う**という
 *    形でずれる（型エラーは出ない）。ここ 1 か所に集約すること。
 *
 * ⚠️ **期間は集金と同じものを渡す。** `getExpenses` の `to` は「含む」で、
 *    書き出しの `endEpoch` も inclusive なのでそのまま合う
 *    （`/funds/chart` の `to` だけが排他。向きを取り違えないこと）。
 * ⚠️ **期間の指定が無いときは全期間。** `getExpenses` は期間を必須にしているので、
 *    無制限を表す値をここで作る。
 * ⚠️ **担当店舗（011）でサーバが絞る。** 担当外の経費は返らない。
 *
 * @returns `{ expenses }` または `{ error }`
 */
export async function fetchExportExpenses(startEpoch, endEpoch, storeIds) {
  const from = startEpoch ?? 0;
  const to = endEpoch ?? Date.now() + 366 * 24 * 60 * 60 * 1000;

  const result = await getExpenses(from, to);
  if (result.error) {
    const message = typeof result.error === "string" ? result.error : result.error.msg;
    return { error: message ?? "経費を取得できませんでした" };
  }

  let expenses = result.data ?? [];

  /*
    ⚠️ **店舗で絞ったら経費も同じ店舗だけにする。**
       ⚠️ **組織全体の経費（`laundry_id` が NULL）は落とす。** 按分の規則が
          無いので勝手に割らない、という規約（店舗別の月別利益と同じ）。
          残すと「1 店舗ぶんの書き出し」に税理士費用が丸ごと乗る。
  */
  if (storeIds) {
    expenses = expenses.filter((e) => e.laundryId && storeIds.includes(e.laundryId));
  }

  return { expenses };
}
