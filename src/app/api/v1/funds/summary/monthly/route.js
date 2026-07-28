import { withAuth, corsPreflight } from "../../../_lib/handler";
import { getCollectMonthlySummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

/** JST は UTC+9。date は JST 深夜 0 時の epoch なので、この分を足してから月を読む */
const JST_OFFSET = 32_400_000;

/**
 * 月次の集金推移。storeId 未指定なら組織全体。
 *
 * ⚠️ getCollectMonthlySummary() は集計せず過去 2 年分の生レコード
 *    （date / totalFunds / laundryId）を返す。Web は画面側で集計しているが、
 *    モバイルに全件流すのは無駄なのでここで畳む。
 *
 * storeCount は「その月に実際に集金があった店舗数」。
 * ⚠️ 組織の現在の店舗数で割ってはいけない。店舗が増減していると過去の月の
 *    平均が実態とずれる（例：1 月は 2 店舗だったのに、今の 5 店舗で割ってしまう）。
 */
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const result = await getCollectMonthlySummary(searchParams.get("storeId"));
  if (result.error) return result;

  const byMonth = new Map();
  for (const row of result.data ?? []) {
    const d = new Date((row.date ?? 0) + JST_OFFSET);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    let current = byMonth.get(key);
    if (!current) {
      current = { month: key, total: 0, count: 0, stores: new Set() };
      byMonth.set(key, current);
    }
    current.total += row.totalFunds ?? 0;
    current.count += 1;
    if (row.laundryId) current.stores.add(row.laundryId);
  }

  // 古い順。グラフは左から右へ時系列で並べる
  const data = [...byMonth.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(({ stores, ...rest }) => ({ ...rest, storeCount: stores.size }));

  return { data };
});

export const OPTIONS = corsPreflight;
