/**
 * PostgREST の行数上限を越えて全件を取る。
 *
 * ⚠️ **上限に当たってもエラーにならない。** 黙って先頭 N 行で打ち切られるので、
 *    「合計が実際より少ない」「履歴が途中で終わっている」という形でしか気づけない。
 *    実際、総額収益（getStoreRevenueSummary）と売上履歴（getOrgCollectFundsInPeriod）が
 *    1000 件で頭打ちになる状態だった。5 店舗 × 月 8 回なら年 480 件なので必ず届く数字。
 *
 * ⚠️ **PAGE_SIZE は PostgREST の max_rows 以下でなければならない**
 *    （supabase/config.toml の `max_rows = 1000`）。これを超える値にすると 1 ページが
 *    満たされず、「短いページ＝終端」と誤判定して**途中で打ち切る**。
 *    max_rows を下げるときはここも必ず下げること。
 *
 * ⚠️ **並び順には一意な列が要る。** date や totalFunds は同点があり得るので、
 *    それだけで並べるとページの境目で行が重複したり飛んだりする。
 *    この関数が最後に id を足しているので、呼び出し側は気にしなくてよい。
 */

const PAGE_SIZE = 1000;
/** 暴走よけ。ここに当たるなら行を全部引かず DB 側で集計するべき段階 */
const MAX_PAGES = 1000;

/**
 * @param {() => object} buildQuery 毎回**新しい**クエリビルダを返す関数。
 *   ⚠️ ビルダは 1 度 await すると使い回せないので、値ではなく関数で受け取る。
 * @returns {Promise<{ data: object[] | null, error: object | null }>}
 */
export async function fetchAllRows(buildQuery) {
  const rows = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await buildQuery()
      // 既に order が付いていればその後ろに足される（同点のときの決着用）
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: null, error };

    const chunk = data ?? [];
    for (const row of chunk) rows.push(row);
    if (chunk.length < PAGE_SIZE) break;
  }

  return { data: rows, error: null };
}
