// app/auth/callback/route.js

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  let next = searchParams.get("next") ?? "/";

  if (!next.startsWith("/")) {
    next = "/";
  }

  const supabase = await createClient();

  // パスワードリセット用のトークン処理（古い方式）
  if (token_hash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash,
    });

    if (!error) {
      const redirectPath = "/auth/updatePassword";
      revalidatePath(redirectPath, "layout");

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // コード交換処理（サインアップ/ログイン + パスワードリセット）
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // セッションからユーザー情報を取得してパスワードリセットかどうか判定
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // パスワードリセットフローの場合は updatePassword ページへ
      // next パラメータが /auth/updatePassword を含むか確認
      if (next.includes("/auth/updatePassword") || next === "/") {
        // ここでパスワードリセットと判定
        const redirectPath = "/auth/updatePassword";
        revalidatePath(redirectPath, "layout");

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(
            `https://${forwardedHost}${redirectPath}`
          );
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        }
      }

      // 通常のログイン/サインアップフロー
      revalidatePath(next, "layout");

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
