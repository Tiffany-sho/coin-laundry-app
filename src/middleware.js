import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  const protectedPaths = ["/account", "/coinLaundry", "/collectMoney", "/settings", "/inventory", "/equipment"];
  const publicAuthPaths = ["/auth/invite"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isPublicAuth = publicAuthPaths.some((path) => pathname.startsWith(path));

  // 未ログインは保護ページにアクセス不可
  if (!user && isProtected && !isPublicAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 初期設定未完了（プロフィールなし）は保護ページにアクセス不可 → ホームへ
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
