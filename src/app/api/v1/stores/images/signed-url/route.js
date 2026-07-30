import { withAuth, corsPreflight } from "../../../_lib/handler";
import { createStoreImageUploadUrl } from "@/app/api/supabaseFunctions/supabaseStorage/serverAction";

export const dynamic = "force-dynamic";

/** Web の CoinLaundryForm と同じ制限（useStoreSubmit.js の invalidFiles 判定） */
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

/**
 * 店舗画像を端末から Storage へ直接アップロードするための署名付き URL を発行する。
 *
 * ⚠️ **アップロードのボディはこの関数を通らない。** 端末は返した signedUrl へ
 *    直接 PUT する。Vercel のサーバーレス関数には 4.5MB のボディ上限があり、
 *    iPhone の写真（2〜5MB）が通らないため、実体の転送を関数の外に出してある。
 *    しかも Vercel の拒否はアップロード途中の接続切断として現れるので、
 *    端末には 413 すら返らず「通信できませんでした」しか出ない。
 *
 * 端末側の PUT はこの形（`src/api/queries.ts` の uploadStoreImage）:
 *
 *     PUT <signedUrl>
 *     content-type: image/jpeg
 *     x-upsert: false
 *     <生のバイト列>
 *
 * 返す url は公開バケットの閲覧 URL、path は `laundry_store.images[].path`。
 * ⚠️ path は削除に要るので、アプリ側は url と一緒に必ず保持すること。
 *
 * ⚠️ この API も POST /api/v1/stores/images と同じく **laundry_store.images は
 *    更新しない。** DB への反映は PATCH /api/v1/stores/:id に images 配列ごと送る
 *    （images を省くと空配列で上書きされる）。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const filename = body?.filename;
  const contentType = body?.contentType;

  if (!filename || typeof filename !== "string") {
    return { error: "ファイル名が指定されていません", status: 400 };
  }
  // ⚠️ 署名付き URL は「そのパスに書ける権利」なので、ここを緩めると laundry/ の外へ
  //    書ける。Server Action 側では検証していないので、この 1 行が唯一の防波堤
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return { error: "ファイル名が不正です", status: 400 };
  }
  // ⚠️ 実体を見られないので拡張子と申告された type しか検証できない。
  //    実際の中身の検査は Storage 側に委ねる
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return { error: "jpeg または png の画像を選んでください", status: 400 };
  }

  const result = await createStoreImageUploadUrl(filename);
  if (result.error) return { error: result.error, status: 500 };

  return { data: { signedUrl: result.signedUrl, url: result.url, path: filename } };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
