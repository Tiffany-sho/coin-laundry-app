import { withAuth, corsPreflight } from "../../../_lib/handler";
import {
  updatePaymentMethod,
  deactivatePaymentMethod,
} from "@/app/api/supabaseFunctions/supabaseDatabase/paymentMethods/action";
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

  const result = await updatePaymentMethod(id, {
    name: body?.name,
    isActive: body?.isActive,
  });
  if (result.error) return result;

  /*
    ⚠️ 文面は **Server Action の戻り値**（実際に保存された行）から組み立てる。
       body の値を使うと、保存に失敗した名前がログに残る。
  */
  await logAction(
    body?.isActive === false
      ? `支払方法「${result.data.name}」を使用停止にしました`
      : body?.isActive === true
        ? `支払方法「${result.data.name}」を再開しました`
        : `支払方法を「${result.data.name}」に変更しました`
  );
  return result;
});

/**
 * ⚠️ **物理削除ではない。** `is_active = false` にするだけ。
 *    過去の集金の `cashless` が methodId で参照しているため。
 */
export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;

  const result = await deactivatePaymentMethod(id);
  if (result.error) return result;

  await logAction(`支払方法「${result.data.name}」を使用停止にしました`);
  return result;
});

export const OPTIONS = corsPreflight;
