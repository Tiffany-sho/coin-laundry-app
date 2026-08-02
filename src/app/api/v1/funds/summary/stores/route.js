import { withAuth, corsPreflight } from "../../../_lib/handler";
import { getStoreRevenueSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { aggregateStoreRevenue } from "@/functions/storeRevenue";

export const dynamic = "force-dynamic";

/**
 * 店舗別の累計売上。
 *
 * ⚠️ getStoreRevenueSummary() は集計せず生レコード（totalFunds / laundryName /
 * laundryId / date）を返す。Web は画面側で集計しているが、モバイルに全件流すのは
 * 無駄なのでここで畳んで返す。
 *
 * ⚠️ **count / firstDate / lastDate をここで出す意味。**
 *    これは**全期間**を見ている唯一の集計。月次サマリー
 *    （/funds/summary/monthly）は前年同月比のため**過去 2 年に固定**されていて、
 *    しかも月単位に畳んだあとなので日にちが分からない。アプリの総額収益カードが
 *    「期間」を出すのに使えるのはこちらだけ。
 *    ⚠️ date を落とすと、カードが期間を出せず「これより前にも記録あり」という
 *    但し書きに戻る（そういう状態だった）。
 */
export const GET = withAuth(async () => {
  const result = await getStoreRevenueSummary();
  if (result.error) return result;

  // ⚠️ 畳み込みは Web の収益ページと同じ `src/functions/storeRevenue.js` を通す。
  //    ここに書き写すと、アプリと Web で総額収益がずれても気づけない
  return { data: aggregateStoreRevenue(result.data) };
});

export const OPTIONS = corsPreflight;
