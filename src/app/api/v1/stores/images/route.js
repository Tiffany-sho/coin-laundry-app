import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  uploadStoreImage,
  deleteStoreImage,
} from "@/app/api/supabaseFunctions/supabaseStorage/serverAction";

export const dynamic = "force-dynamic";

/** Web の CoinLaundryForm と同じ制限（useStoreSubmit.js の invalidFiles 判定） */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

/** Storage 側の既定上限に合わせる。これを超えるとアップロード時に落ちる */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * 店舗画像のアップロード。
 *
 * ⚠️ アプリは SUPABASE_SERVICE_KEY を持てないので、必ずこの経路を通す。
 *    実処理は Web と共通の Server Action（uploadStoreImage）で、
 *    サーバー内で service client を使って Laundry-Images/laundry/ に置く。
 *
 * 返す形は laundry_store.images の 1 要素と同じ { url, path }。
 * path は削除に要るので、アプリ側は必ず一緒に保持すること。
 *
 * ⚠️ この API は Storage に置くだけで laundry_store.images は更新しない。
 *    DB への反映は PATCH /api/v1/stores/:id に images 配列ごと送って行う
 *    （images を省くと空配列で上書きされる）。
 */
export const POST = withAuth(async (request) => {
  let form;
  try {
    form = await request.formData();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const file = form.get("file");
  const filename = form.get("filename");

  if (!file || typeof file === "string") {
    return { error: "画像が添付されていません", status: 400 };
  }
  if (!filename || typeof filename !== "string") {
    return { error: "ファイル名が指定されていません", status: 400 };
  }
  // パス区切りを含む名前を許すと laundry/ の外へ書けてしまう
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return { error: "ファイル名が不正です", status: 400 };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "jpeg または png の画像を選んでください", status: 400 };
  }
  if (file.size > MAX_BYTES) {
    return { error: "画像のサイズが大きすぎます（10MB まで）", status: 400 };
  }

  const result = await uploadStoreImage(form);
  if (result.error) return { error: result.error, status: 500 };

  return { data: { url: result.url, path: filename } };
});

/** 画像 1 枚の削除。path は POST が返した値（laundry/ は付けない） */
export const DELETE = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const path = body?.path;
  if (!path || typeof path !== "string") {
    return { error: "削除する画像が指定されていません", status: 400 };
  }
  if (path.includes("/") || path.includes("\\") || path.includes("..")) {
    return { error: "ファイル名が不正です", status: 400 };
  }

  const result = await deleteStoreImage(path);
  if (result.error) return { error: result.error, status: 500 };

  return { data: { path } };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
