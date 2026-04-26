import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, orgName, inviterName, role, inviteUrl } = await request.json();

    if (!email || !inviteUrl) {
      return NextResponse.json({ error: "必要なパラメータが不足しています" }, { status: 400 });
    }

    const roleLabel =
      role === "owner" ? "店舗管理者" : role === "collecter" ? "集金担当者" : "閲覧者";

    const { error } = await resend.emails.send({
      from: "Collecie <noreply@collecie.com>",
      to: email,
      subject: `【Collecie】${orgName} への招待が届いています`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
          <h1 style="font-size: 22px; font-weight: bold; color: #1a202c; margin-bottom: 8px;">
            組織への招待
          </h1>
          <p style="color: #4a5568; margin-bottom: 24px;">
            <strong>${inviterName}</strong> さんから <strong>${orgName}</strong> への招待が届いています。
          </p>

          <div style="background: #ebf8ff; border-left: 4px solid #3182ce; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0; color: #2b6cb0; font-size: 14px;">
              役割：<strong>${roleLabel}</strong>
            </p>
          </div>

          <a href="${inviteUrl}"
            style="display: inline-block; background: #3182ce; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            招待を承認する
          </a>

          <p style="margin-top: 24px; font-size: 12px; color: #a0aec0;">
            このリンクは7日間有効です。心当たりがない場合は無視してください。
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: "メール送信に失敗しました", detail: error?.message ?? String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invite API error:", err);
    return NextResponse.json({ error: "予期しないエラーが発生しました" }, { status: 500 });
  }
}
