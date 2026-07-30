import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getStore,
  updateStore,
  deleteStore,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { toStoreFormData, sanitizeStoreError, storeNameOf } from "../_form";

export const dynamic = "force-dynamic";

// 組織スコープの確認は getStore() 側が行う（他組織の id を渡しても引けない）
export const GET = withAuth(async (request, context) => {
  const { id } = await context.params;
  return await getStore(id);
});

/**
 * 店舗情報の更新。admin 以外は Server Action 側で弾かれる。
 *
 * ⚠️ images を送らないと空配列で上書きされて既存の画像が消える
 *    （updateStore は images を必ず update に含めるため）。
 *    アプリからは画像を編集できないので、GET で取得した images を
 *    そのまま送り返して温存すること。
 */
export const PATCH = withAuth(async (request, context) => {
  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.store) return { error: "店舗名を入力してください", status: 400 };

  const result = sanitizeStoreError(await updateStore(toStoreFormData(body), id));
  if (!result?.error) await logAction(`${storeNameOf(result?.data)}店の編集が完了しました。`);
  return result;
});

/** 店舗の削除。集金データ・在庫状況ごと消えるので、呼ぶ前に必ず確認を取ること */
export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  const result = await deleteStore(id);
  // deleteStore は削除した行（store, images）を返すので、そこから名前を取る
  if (!result?.error) await logAction(`${storeNameOf(result?.data)}店を削除しました`);
  return result;
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
