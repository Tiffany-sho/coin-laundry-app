import { withAuth, corsPreflight } from "../../../_lib/handler";
import { updateStockState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { laundryNameOf } from "../../../_lib/logNames";

export const dynamic = "force-dynamic";

// 在庫を更新。extra_stocks / stock_thresholds も同じ口で受ける
export const PATCH = withAuth(async (request, context) => {
  const { laundryId } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await updateStockState(laundryId, {
    detergent: body?.detergent,
    softener: body?.softener,
    extra_stocks: body?.extra_stocks,
    stock_thresholds: body?.stock_thresholds,
  });

  /**
   * ⚠️ 店舗名は**成功してから**引く。先に引くと、権限が無い相手の店舗名まで
   *    取りにいくことになる（認可は updateStockState 側が持っている）。
   *
   * ⚠️ 数量の変更と「在庫設定」（警告ライン・追加在庫）は同じ口で、
   *    どちらも 4 項目すべてを送ってくるので**区別できない。**
   *    文面を分けたいなら、まず送り分ける手段を作ること。
   */
  if (!result?.error) {
    await logAction(`${await laundryNameOf(laundryId)}店の在庫を更新しました`);
  }
  return result;
});

export const OPTIONS = corsPreflight;
