import { withAuth, corsPreflight } from "../../../_lib/handler";
import { getStoreRevenueSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

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

  const byStore = new Map();
  for (const row of result.data ?? []) {
    const amount = row.totalFunds ?? 0;
    const date = typeof row.date === "number" ? row.date : null;
    const current = byStore.get(row.laundryId);

    if (!current) {
      byStore.set(row.laundryId, {
        laundryId: row.laundryId,
        laundryName: row.laundryName,
        total: amount,
        count: 1,
        firstDate: date,
        lastDate: date,
      });
      continue;
    }

    current.total += amount;
    current.count += 1;
    if (date !== null) {
      if (current.firstDate === null || date < current.firstDate) current.firstDate = date;
      if (current.lastDate === null || date > current.lastDate) current.lastDate = date;
    }
  }

  // 売上の多い順
  return { data: [...byStore.values()].sort((a, b) => b.total - a.total) };
});

export const OPTIONS = corsPreflight;
