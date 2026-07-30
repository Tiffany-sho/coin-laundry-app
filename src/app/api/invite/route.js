import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../supabaseFunctions/supabaseDatabase/user/action";
import { sendInviteEmail } from "./sendInviteEmail";

/** ⚠️ `/api/v1/org/invitations` と同じ既定値。片方だけ変えないこと */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.collecie.com";

/**
 * 招待メールの送信。Web の InviteForm から同一オリジンで叩かれる（Cookie が乗る）。
 *
 * ⚠️ **もとは認証も検証も無く、body の値をそのまま Resend に渡していた。**
 *    つまり誰でも「任意の宛先」へ「任意のリンク」を **collecie.com のドメインから**
 *    送れる状態だった。Resend の送信枠を使い潰されるだけでなく、自分のドメインを
 *    踏み台にしたフィッシングメールを作られる。
 *
 * いまは body の値を**一切信用しない**。トークンだけ受け取り、宛先・組織名・ロール・
 * 招待者名・リンクはすべて DB と環境変数から組み立てる。
 *
 * ⚠️ トークンを持っているだけでは送れない。**その組織の admin であること**まで見る。
 *    招待の作成（`inviteMember`）が admin 限定なので、ここも同じ基準に揃えないと
 *    「作成はできないが再送はできる」という穴が残る。
 *
 * ⚠️ アプリ（モバイル）はこの経路を使わない。`POST /api/v1/org/invitations` が
 *    `sendInviteEmail` を直接呼ぶ。文面を変えるときは `sendInviteEmail.js` を直す。
 */
export async function POST(request) {
  try {
    const { user } = await getUser();
    if (!user) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const token = extractToken(body);
    if (!token) {
      return NextResponse.json({ error: "必要なパラメータが不足しています" }, { status: 400 });
    }

    // ⚠️ service client で引く。RLS 下だと条件によって行が見えず、
    //    「存在しない」と「見えない」が区別できなくなる
    const supabase = createServiceClient();

    const { data: invitation, error: lookupError } = await supabase
      .from("organization_invitations")
      .select(
        "org_id, email, role, expires_at, accepted_at, organizations(name), profiles!invited_by(username)"
      )
      .eq("token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Invite API lookup error:", lookupError);
      return NextResponse.json({ error: "招待の確認に失敗しました" }, { status: 500 });
    }
    if (!invitation) {
      return NextResponse.json({ error: "招待が見つかりません" }, { status: 404 });
    }
    if (invitation.accepted_at) {
      return NextResponse.json({ error: "この招待はすでに使われています" }, { status: 409 });
    }
    if (invitation.expires_at && new Date(invitation.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "この招待は期限が切れています" }, { status: 410 });
    }

    const { data: myMember } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", invitation.org_id)
      .maybeSingle();

    if (myMember?.role !== "admin") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { error } = await sendInviteEmail({
      // ⚠️ すべて DB 側の値。body の email / orgName / inviterName / inviteUrl は使わない
      email: invitation.email,
      orgName: invitation.organizations?.name ?? "",
      inviterName: invitation.profiles?.username ?? "管理者",
      role: invitation.role,
      inviteUrl: `${APP_URL}/auth/invite/${token}`,
    });

    if (error) {
      return NextResponse.json(
        { error: "メール送信に失敗しました", detail: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invite API error:", err);
    return NextResponse.json({ error: "予期しないエラーが発生しました" }, { status: 500 });
  }
}

/**
 * リクエストからトークンを取り出す。
 *
 * Web の InviteForm は `inviteUrl` を `${origin}/auth/invite/${token}` の形で送ってくるので
 * 末尾のパスを取る。⚠️ **`inviteUrl` 自体はメールに載せない。** 差し替えられるので、
 * 使うのはトークンの取り出しだけで、リンクは `APP_URL` から組み直す。
 * 明示的な `token` も受け付ける（新しい呼び出し側はこちらを使うほうが素直）。
 */
function extractToken(body) {
  if (typeof body?.token === "string" && body.token.length > 0) return body.token;

  const url = body?.inviteUrl;
  if (typeof url !== "string") return null;

  const last = url.split("?")[0].split("#")[0].replace(/\/+$/, "").split("/").pop();
  return last && last.length > 0 ? last : null;
}
