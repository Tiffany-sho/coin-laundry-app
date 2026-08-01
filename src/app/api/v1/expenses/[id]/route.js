import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  updateExpense,
  deleteExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * ⚠️ **展開された固定費の id は使えない。** 一覧が返す `recurring:<定義id>:<YYYY-MM>`
 *    は実在しない行なので、ここへ渡しても 404 になる。アプリは `recurring: true` の
 *    項目に編集・削除の導線を出さないこと。
 */
function rejectRecurringId(id) {
  return String(id).startsWith("recurring:")
    ? {
        error: "毎月の固定費は個別に編集できません。固定費の設定から変更してください",
        status: 400,
      }
    : null;
}

export const PATCH = withAuth(async (request, context) => {
  const { id } = await context.params;
  const rejected = rejectRecurringId(id);
  if (rejected) return rejected;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await updateExpense(id, {
    laundryId: body?.storeId ?? null,
    date: body?.date,
    amount: body?.amount,
    category: body?.category,
    note: body?.note ?? null,
  });
  if (result.error) return result;

  await logAction(`経費を編集しました（${result.data.category}）`);
  return result;
});

export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  const rejected = rejectRecurringId(id);
  if (rejected) return rejected;

  const result = await deleteExpense(id);
  if (result.error) return result;

  await logAction("経費を削除しました");
  return result;
});

export const OPTIONS = corsPreflight;
