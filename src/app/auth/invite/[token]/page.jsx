import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getInvitation } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { redirect } from "next/navigation";
import InviteAcceptClient from "./InviteAcceptClient";

export default async function InvitePage({ params }) {
  const { token } = await params;
  const { user } = await getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/auth/invite/${token}`);
  }

  const { data: invitation, error } = await getInvitation(token);

  if (error || !invitation) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <h2>招待が見つかりません</h2>
        <p>招待リンクが無効または期限切れです。</p>
        <a href="/">ホームへ戻る</a>
      </div>
    );
  }

  if (invitation.accepted_at) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <h2>この招待はすでに使用済みです</h2>
        <a href="/">ホームへ戻る</a>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <h2>招待の有効期限が切れています</h2>
        <p>オーナーに再度招待を依頼してください。</p>
        <a href="/">ホームへ戻る</a>
      </div>
    );
  }

  return <InviteAcceptClient token={token} invitation={invitation} />;
}
