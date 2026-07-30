import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getProfile,
  updateProfile,
  registerProfile,
  setCollectMethod,
  updateAvatarUrl,
} from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { buildAvatarPublicUrl } from "@/app/api/supabaseFunctions/supabaseStorage/serverAction";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getProfile());

/** 初回登録。プロフィール未作成のユーザーが最初に叩く */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.username) return { error: "表示名を入力してください", status: 400 };

  // ⚠️ collectMethod に入れてよいのは "machines" / "total" だけ。
  //    Web の useCollectMethod.js が collectMethod === "machines" で判定しているため、
  //    別表記を書き込むと Web 側で「まとめて集金」に見えてしまう。
  const collectMethod = body.collectMethod === "total" ? "total" : "machines";
  const role = ["admin", "collecter", "viewer"].includes(body.role) ? body.role : "collecter";

  return await registerProfile({
    fullname: body.fullname ?? "",
    username: body.username,
    collectMethod,
    role,
  });
});

export const PATCH = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  if (body?.collectMethod !== undefined) {
    const result = await setCollectMethod(body.collectMethod);
    if (!result?.error) await logAction("集金方法を変更しました");
    return result;
  }

  /**
   * アバターの確定。POST /profile/avatar/signed-url で得た拡張子だけを受け取る。
   *
   * ⚠️ **URL は受け取らない。サーバが user.id から組み直す。** URL を受け付けると、
   *    他メンバーの画面に描かれる画像の src を自由に差し替えられる。
   */
  if (body?.avatarExt !== undefined) {
    const built = await buildAvatarPublicUrl(body.avatarExt);
    if (built.error) return { error: built.error, status: 400 };
    const saved = await updateAvatarUrl(built.url);
    // ⚠️ updateAvatarUrl は PostgrestError をそのまま返す。英語の生メッセージを
    //    アプリに流さないよう日本語に置き換える（BFF の応答は日本語で揃える契約）
    if (saved?.error) {
      console.error("[api/v1/profile] avatar url save error:", saved.error);
      return { error: "アイコンの保存に失敗しました", status: 500 };
    }
    await logAction("アイコンを更新しました");
    return { data: { avatarUrl: built.url } };
  }

  if (body?.username !== undefined || body?.fullname !== undefined) {
    const result = await updateProfile({ fullname: body.fullname, username: body.username });
    if (!result?.error) await logAction("アカウント情報を更新しました");
    return result;
  }
  return { error: "更新する内容がありません", status: 400 };
});

export const OPTIONS = corsPreflight;
