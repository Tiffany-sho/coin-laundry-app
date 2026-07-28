import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getMonthFunds,
  getRecentCollectFunds,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import {
  getStockStates,
  getMachinesStates,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";

export const dynamic = "force-dynamic";

// ホームに出す件数。全件はそれぞれのタブで取る
const RECENT_LIMIT = 5;

/**
 * ホーム画面の 1 リクエスト集約。
 * 低在庫・故障は「件数」だけ返し、明細は管理タブで取得する（設計図 6.3）。
 *
 * 組織未所属の場合、委譲先はいずれも空配列を返すのでゼロ値がそのまま出る。
 */
export const GET = withAuth(async () => {
  const [monthFunds, recent, stock, machines] = await Promise.all([
    getMonthFunds(),
    getRecentCollectFunds(),
    getStockStates(),
    getMachinesStates(),
  ]);

  const monthRows = monthFunds?.data ?? [];
  const monthTotal = monthRows.reduce((sum, row) => sum + (row.totalFunds ?? 0), 0);
  // ヒーローカードに出す「集金回数」。Web の SalesCard と同じ数え方（レコード数）
  const collectCount = monthRows.length;

  const recentFunds = (recent?.data ?? []).slice(0, RECENT_LIMIT).map((row) => ({
    id: row.id,
    laundryName: row.laundryName,
    totalFunds: row.totalFunds,
    date: row.date,
    // 退会済みユーザーは profiles が引けないので null になる
    collecter: row.profiles?.username ?? null,
  }));

  return {
    data: {
      monthTotal,
      collectCount,
      recentFunds,
      lowStockCount: (stock?.lowStockItems ?? []).length,
      brokenMachineCount: (machines?.breakMachines ?? []).length,
    },
  };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
