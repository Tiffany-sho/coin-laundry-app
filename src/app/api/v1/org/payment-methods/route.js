import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getPaymentMethods,
  createPaymentMethod,
} from "@/app/api/supabaseFunctions/supabaseDatabase/paymentMethods/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * 組織の支払方法。
 *
 * ⚠️ **現金は含まれない。** 常に存在する暗黙の方法なので、アプリ側が
 *    一覧の先頭に自前で足すこと。ここに行として返すと、集金画面で
 *    現金を 2 回入力できてしまう。
 *
 * ⚠️ GET は無効化したものも返す（設定画面で戻せるように）。
 *    集金画面は `isActive` で絞ること。
 */
export const GET = withAuth(async () => await getPaymentMethods());

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await createPaymentMethod(body?.name);
  if (result.error) return result;

  // 組織の設定を変える操作なので記録する（docs/contracts.md の「何を記録するか」）
  await logAction(`支払方法「${result.data.name}」を追加しました`);
  return result;
});

export const OPTIONS = corsPreflight;
