"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../supabaseDatabase/user/action";

export const uploadStoreImage = async (formData) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const file = formData.get("file");
  const filename = formData.get("filename");

  if (!file || !filename) return { error: "ファイルが不正です" };

  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from("Laundry-Images")
    .upload(`laundry/${filename}`, file, { contentType: file.type });

  if (error) {
    console.error("Storage upload error:", error);
    return { error: "画像のアップロードに失敗しました" };
  }

  const { data } = supabase.storage
    .from("Laundry-Images")
    .getPublicUrl(`laundry/${filename}`);

  return { url: data.publicUrl };
};

/**
 * 端末から Storage へ**直接**アップロードするための署名付き URL を作る。
 *
 * ⚠️ **なぜ BFF 経由（uploadStoreImage）では足りないのか。**
 *    Vercel のサーバーレス関数はリクエストボディが 4.5MB を超えると**関数に届く前に**
 *    弾く。iPhone の写真は 2〜5MB になるので現実的に踏み、しかも拒否がアップロード
 *    途中の接続切断として現れるため、端末側には 413 すら返らず fetch の例外
 *    （「通信できませんでした」）しか出ない。関数を経由しないこの経路なら
 *    上限は Storage のバケット設定だけになる。
 *
 * ⚠️ 署名付き URL は「そのパスに書ける権利」を 2 時間渡すもの。**filename の検証は
 *    呼び出し側（BFF ルート）で必ず行うこと。** `..` や `/` を通すと laundry/ の外へ
 *    書けてしまう。
 *
 * ⚠️ upsert は付けない（既定 false）。ファイル名は `${Date.now()}_${uuid}.${ext}` で
 *    衝突しないので、上書きを許す理由が無い。許すと既存の画像を差し替えられる。
 */
export const createStoreImageUploadUrl = async (filename) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };
  if (!filename) return { error: "ファイル名が指定されていません" };

  const supabase = createServiceClient();
  const path = `laundry/${filename}`;

  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .createSignedUploadUrl(path);

  if (error) {
    console.error("Storage signed upload url error:", error);
    return { error: "アップロード先の準備に失敗しました" };
  }

  // 公開バケットなので、アップロード後の閲覧 URL は署名なしで組める
  const { data: pub } = supabase.storage.from("Laundry-Images").getPublicUrl(path);

  return { signedUrl: data.signedUrl, url: pub.publicUrl };
};

export const deleteStoreImage = async (filePath) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .remove([`laundry/${filePath}`]);

  if (error || data?.length === 0) return { error: "画像の削除に失敗しました" };
  return {};
};
