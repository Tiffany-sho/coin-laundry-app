import { withAuth, corsPreflight } from "../../../_lib/handler";
import { getStoreRevenueSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

/**
 * 店舗別の累計売上。
 *
 * ⚠️ getStoreRevenueSummary() は集計せず生レコード（totalFunds / laundryName / laundryId）を
 * 返す。Web は画面側で集計しているが、モバイルに全件流すのは無駄なのでここで畳んで返す。
 */
export const GET = withAuth(async () => {
  const result = await getStoreRevenueSummary();
  if (result.error) return result;

  const byStore = new Map();
  for (const row of result.data ?? []) {
    const current = byStore.get(row.laundryId);
    if (current) {
      current.total += row.totalFunds ?? 0;
    } else {
      byStore.set(row.laundryId, {
        laundryId: row.laundryId,
        laundryName: row.laundryName,
        total: row.totalFunds ?? 0,
      });
    }
  }

  // 売上の多い順
  return { data: [...byStore.values()].sort((a, b) => b.total - a.total) };
});

export const OPTIONS = corsPreflight;
