import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getStores,
  createStore,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { toStoreFormData, sanitizeStoreError } from "./_form";

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

  return sanitizeStoreError(await createStore(toStoreFormData(body)));
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
