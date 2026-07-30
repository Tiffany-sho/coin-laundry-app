import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getStores,
  createStore,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { toStoreFormData, sanitizeStoreError, storeNameOf } from "./_form";

export const dynamic = "force-dynamic";

// 組織未所属なら getStores() が空配列を返すので、そのまま通す
export const GET = withAuth(async () => await getStores());

/** 店舗の新規登録。admin 以外は Server Action 側で弾かれる */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.store) return { error: "店舗名を入力してください", status: 400 };

  const result = sanitizeStoreError(await createStore(toStoreFormData(body)));
  /**
   * ⚠️ 店舗名は**登録結果**から取る（body.store をそのまま使わない）。
   *    実際に保存された名前と違うものをログに残せてしまうため。
   */
  if (!result?.error) await logAction(`${storeNameOf(result?.data)}店の登録が完了しました。`);
  return result;
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
