"use server";

import { Resend } from "resend";
import { getUser } from "../supabaseDatabase/user/action";

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = "mituya1884tansan@gmail.com";

const TYPE_LABELS = {
  bug: "🐛 バグ報告",
  feature: "💡 機能の提案",
  other: "💬 その他",
};

export async function sendFeedback({ type, description }) {
  if (!description?.trim()) return { error: "内容を入力してください" };

  const { user } = await getUser();
  const userInfo = user ? user.email : "未ログイン";
  const typeLabel = TYPE_LABELS[type] ?? type;
  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const { error } = await resend.emails.send({
    from: "Collecie <noreply@collecie.com>",
    to: OWNER_EMAIL,
    subject: `[Collecie フィードバック] ${typeLabel}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; background: #f0f9ff; padding: 32px 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="margin: 0; color: white; font-size: 18px; font-weight: bold;">Collecie フィードバック</h1>
          <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">${now}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; border: 1px solid #e0f2fe;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">種類</p>
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0e7490;">${typeLabel}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; border: 1px solid #e0f2fe;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">送信者</p>
          <p style="margin: 0; font-size: 14px; color: #1e3a5f;">${userInfo}</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 20px 24px; border: 1px solid #e0f2fe;">
          <p style="margin: 0 0 12px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">内容</p>
          <p style="margin: 0; font-size: 15px; color: #1e3a5f; line-height: 1.7; white-space: pre-wrap;">${description.trim()}</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Feedback send error:", error);
    return { error: "送信に失敗しました。しばらく経ってから再試行してください。" };
  }
  return {};
}
