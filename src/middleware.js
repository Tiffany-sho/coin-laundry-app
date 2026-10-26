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

  /*
    ログインは要るが **組織への所属は要らない**ページ。

    ⚠️ **`/settings/delete-account` を外さないこと。** `/settings` で始まるので
       下の membership 判定に掛かり、**組織未所属の人がホームへ飛ばされて
       アカウントを削除する手段が 1 つも無くなる。**
       削除ボタンは未所属ユーザーのホーム（JoinOrganizationHome →
       OtherActionsCard）に出ているので、押せるのに必ず戻るという形で詰まる。
       App Store Guideline 5.1.1(v)（アプリ内から削除を開始できること）に
       触れるため、2026-10-26 に demo アカウントで再現して直した。

    ⚠️ **ここに足すのは「自分のことだけを触るページ」に限る。** 組織の
       データを見るページを足すと、未所属の人に他組織が見えうる。
       認可自体は各 Server Action が自前で確かめているが、
       この配列を増やすほどその前提に寄りかかることになる。
  */
  const orgOptionalPaths = ["/settings/delete-account"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isPublicAuth = publicAuthPaths.some((path) => pathname.startsWith(path));
  const isOrgOptional = orgOptionalPaths.some((path) => pathname.startsWith(path));

  // 未ログインは保護ページにアクセス不可
  if (!user && isProtected && !isPublicAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  /*
    プロフィールなし・admin以外でorgなし → ホームのみ許可

    ⚠️ 未ログインの判定（上）には `isOrgOptional` を掛けない。
       アカウント削除もログインは必須。
  */
  if (user && isProtected && !isOrgOptional) {
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
