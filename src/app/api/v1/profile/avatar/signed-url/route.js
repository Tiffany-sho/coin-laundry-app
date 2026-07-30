import { withAuth, corsPreflight } from "../../../_lib/handler";
import { createAvatarUploadUrl } from "@/app/api/supabaseFunctions/supabaseStorage/serverAction";

export const dynamic = "force-dynamic";

/** 受け付ける形式 → 保存する拡張子 */
const ALLOWED_TYPES = { "image/jpeg": "jpg", "image/png": "png" };

/**
 * アバターを端末から Storage へ直接アップロードするための署名付き URL を発行する。
 *
 * ⚠️ **アップロードのボディはこの関数を通らない。** 端末は返した signedUrl へ
 *    直接 PUT する（店舗画像と同じ理由：Vercel の 4.5MB 上限を避ける）。
 *
 * ⚠️ **パスはサーバが user.id から組む。** クライアントはファイル名を渡せない。
 *    渡せるようにすると他人のアバターを差し替えられる。
 *
 * 端末側の PUT はこの形（`src/api/queries.ts` の uploadAvatar）:
 *
 *     PUT <signedUrl>
 *     content-type: image/jpeg
 *     x-upsert: true      ← ⚠️ パスが固定なので上書きになる
 *     <生のバイト列>
 *
 * ⚠️ **この API は profiles.avatar_url を更新しない。** アップロードが終わったら
 *    `PATCH /api/v1/profile` に `{ avatarExt }` を送って確定させる。
 *    先に URL を書くと、PUT が失敗したときに存在しないファイルを指すことになる。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const ext = ALLOWED_TYPES[body?.contentType];
  if (!ext) return { error: "jpeg または png の画像を選んでください", status: 400 };

  const result = await createAvatarUploadUrl(ext);
  if (result.error) return { error: result.error, status: 500 };

  return { data: { signedUrl: result.signedUrl, ext: result.ext } };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
