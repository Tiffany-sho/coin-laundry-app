import { NextResponse } from "next/server";
import { sendInviteEmail } from "./sendInviteEmail";

export async function POST(request) {
  try {
    const { email, orgName, inviterName, role, inviteUrl } = await request.json();

    if (!email || !inviteUrl) {
      return NextResponse.json({ error: "必要なパラメータが不足しています" }, { status: 400 });
    }

    const { error } = await sendInviteEmail({ email, orgName, inviterName, role, inviteUrl });

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
