import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  const protectedPaths = ["/account", "/coinLaundry", "/collectMoney", "/settings", "/inventory", "/equipment"];
  /*
    ⚠️ **2026-08-06 に空になった。** `/auth/invite`（メール招待のリンク）を
       廃止したため（013 で「申請 → オーナーが承認」に置き換えた）。
    ⚠️ **配列ごと消さないこと。** 下の `isPublicAuth` が参照している。
  */
  const publicAuthPaths = [];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isPublicAuth = publicAuthPaths.some((path) => pathname.startsWith(path));

  // 未ログインは保護ページにアクセス不可
  if (!user && isProtected && !isPublicAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // プロフィールなし・admin以外でorgなし → ホームのみ許可
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (profile.role !== "admin") {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // api/v1 はモバイル向けの Bearer 認証。Cookie セッションを前提とする
    // updateSession を通す必要がないため除外する。
    "/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
