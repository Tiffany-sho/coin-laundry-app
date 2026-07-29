import { withAuth, corsPreflight } from "../../../_lib/handler";
import { verifyTransaction } from "@/utils/apple/verify";
import { applyAppleTransaction } from "@/app/api/supabaseFunctions/supabaseDatabase/billing/appleAction";

export const dynamic = "force-dynamic";

/**
 * アプリ内課金の購入 / 復元をサーバーで確定させる。
 *
 * アプリは StoreKit から受け取った署名済みトランザクション（JWS）をそのまま
 * ここへ送る。サーバーは Apple のルート CA まで署名を辿って検証してから
 * organizations.plan を書き換える。
 *
 * ⚠️ **アプリ側の判定だけでプランを上げてはいけない。** StoreKit の戻り値は
 *    端末の中の話なので、改造した端末からは自由に作れる。正はここ。
 *
 * ⚠️ アプリは 200 を受け取ってから finishTransaction() を呼ぶこと。
 *    先に finish すると、検証に失敗したときに購入が復元不能になる。
 *
 * 成功: { data: { plan, planSource, productId, expiresAt, active } }
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const jws = body?.jws;
  if (!jws || typeof jws !== "string") {
    return { error: "購入情報が含まれていません", status: 400 };
  }

  const verified = await verifyTransaction(jws);
  if (verified.error) return { error: verified.error, status: 400 };

  return await applyAppleTransaction(verified.data);
});

export const OPTIONS = corsPreflight;
