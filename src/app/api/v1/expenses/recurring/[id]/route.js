import { withAuth, corsPreflight } from "../../../_lib/handler";
import {
  updateRecurringExpense,
  deleteRecurringExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (request, context) => {
  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await updateRecurringExpense(id, {
    laundryId: body?.storeId ?? null,
    name: body?.name,
    amount: body?.amount,
    category: body?.category,
    dayOfMonth: body?.dayOfMonth,
    startMonth: body?.startMonth,
    endMonth: body?.endMonth ?? null,
  });
  if (result.error) return result;

  await logAction(`毎月の固定費「${result.data.name}」を変更しました`);
  return result;
});

/**
 * ⚠️ **過去の月からも消える。** 展開は定義から毎回計算するため、
 *    削除するとこれまで計上されていた分もまとめて無くなる。
 *    「これまでの分は残したい」なら削除ではなく `endMonth` を入れること。
 *    アプリ側の確認ダイアログでもそう案内する。
 */
export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;

  const result = await deleteRecurringExpense(id);
  if (result.error) return result;

  await logAction(`毎月の固定費「${result.data.name}」を削除しました`);
  return result;
});

export const OPTIONS = corsPreflight;
