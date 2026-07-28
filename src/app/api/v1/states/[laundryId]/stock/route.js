import { withAuth, corsPreflight } from "../../../_lib/handler";
import { updateStockState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";

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

  return await updateStockState(laundryId, {
    detergent: body?.detergent,
    softener: body?.softener,
    extra_stocks: body?.extra_stocks,
    stock_thresholds: body?.stock_thresholds,
  });
});

export const OPTIONS = corsPreflight;
