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

/** アバターに使える拡張子。値は Storage へ申告する content-type */
const AVATAR_EXT = { jpg: "image/jpeg", png: "image/png" };

/**
 * アバターのパス。**必ず user.id から組む。**
 *
 * ⚠️ クライアントからファイル名を受け取らないこと。署名付き URL は「そのパスに
 *    書ける権利」なので、名前を渡せるようにすると他人のアバターを差し替えられる。
 */
const avatarPath = (userId, ext) => `avatars/${userId}.${ext}`;

/**
 * アバターを端末から Storage へ**直接**アップロードするための署名付き URL を作る。
 *
 * ⚠️ **Web の /api/upload/avatar（multipart）をアプリから使わない。** あちらは実体が
 *    Vercel のサーバーレス関数を通るので 4.5MB の上限に当たる（店舗画像と同じ罠。
 *    しかも拒否がアップロード途中の接続切断として現れ、端末には「通信できませんでした」
 *    しか出ない）。
 *
 * ⚠️ **upsert: true が必要。** パスが `avatars/{user.id}.{ext}` で固定なので、
 *    2 回目以降は必ず既存ファイルへの上書きになる。店舗画像（時刻 + uuid で
 *    衝突しない）とはここが逆。
 */
export const createAvatarUploadUrl = async (ext) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };
  if (!AVATAR_EXT[ext]) return { error: "jpeg または png の画像を選んでください" };

  const supabase = createServiceClient();
  const path = avatarPath(user.id, ext);

  const { data, error } = await supabase.storage
    .from("Laundry-Images")
    .createSignedUploadUrl(path, { upsert: true });

  if (error) {
    console.error("Avatar signed upload url error:", error);
    return { error: "アップロード先の準備に失敗しました" };
  }

  return { signedUrl: data.signedUrl, ext };
};

/**
 * アップロード済みのアバターの公開 URL を組む。
 *
 * ⚠️ **クライアントから URL を受け取らない。** ここで user.id から組み直す。
 *    URL を受け付けると、他メンバーの画面に描かれる img の src を自由に差し替えられる。
 *
 * ⚠️ **`?v=` を必ず付ける。** パスが固定なので、付けないと URL が前回と 1 文字も
 *    変わらず、端末とブラウザのキャッシュが古い画像を出し続ける（変えたのに
 *    変わらないように見える）。DB に入れる値ごとキャッシュバスタを含める。
 */
export const buildAvatarPublicUrl = async (ext) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };
  if (!AVATAR_EXT[ext]) return { error: "jpeg または png の画像を選んでください" };

  const supabase = createServiceClient();
  const { data } = supabase.storage
    .from("Laundry-Images")
    .getPublicUrl(avatarPath(user.id, ext));

  return { url: `${data.publicUrl}?v=${Date.now()}` };
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
