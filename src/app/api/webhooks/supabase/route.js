import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/utils/supabase/service";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "profiles") {
    return NextResponse.json({ ok: true });
  }

  const userId = payload.record?.id;
  if (!userId) return NextResponse.json({ ok: true });

  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !user?.email) {
    console.error("Failed to get user email:", error);
    return NextResponse.json({ ok: true });
  }

  const { error: sendError } = await resend.emails.send({
    from: "Collecie <noreply@collecie.com>",
    to: user.email,
    subject: "【Collecie】ご登録ありがとうございます",
    html: welcomeHtml(),
  });

  if (sendError) {
    console.error("Welcome email send error:", sendError);
  }

  return NextResponse.json({ ok: true });
}

function welcomeHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F0F9FF;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F9FF;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">

        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:22px;font-weight:800;color:#155E75;letter-spacing:-0.5px;">Collecie</span>
        </td></tr>

        <tr><td style="background:#ffffff;border-radius:16px;padding:40px 32px;border:1px solid #CFFAFE;">

          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:64px;height:64px;background:linear-gradient(135deg,#0891B2,#0E7490);border-radius:50%;line-height:64px;font-size:28px;">👋</div>
          </div>

          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#155E75;text-align:center;">
            ご登録ありがとうございます！
          </h1>
          <p style="margin:0 0 28px;font-size:14px;color:#64748B;text-align:center;line-height:1.8;">
            Collecie へようこそ。<br>
            コインランドリーの集金・在庫・設備管理を<br>かんたんに一元管理できます。
          </p>

          <div style="background:#F0F9FF;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0E7490;">はじめの3ステップ</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:20px;height:20px;background:#0891B2;border-radius:50%;color:white;font-size:11px;font-weight:700;text-align:center;line-height:20px;margin-right:10px;">1</span>
                  <span style="font-size:13px;color:#1E3A5F;">店舗を登録する</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:20px;height:20px;background:#0891B2;border-radius:50%;color:white;font-size:11px;font-weight:700;text-align:center;line-height:20px;margin-right:10px;">2</span>
                  <span style="font-size:13px;color:#1E3A5F;">集金記録を入力する</span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="display:inline-block;width:20px;height:20px;background:#0891B2;border-radius:50%;color:white;font-size:11px;font-weight:700;text-align:center;line-height:20px;margin-right:10px;">3</span>
                  <span style="font-size:13px;color:#1E3A5F;">売上グラフで推移を確認する</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            <a href="https://www.collecie.com"
               style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0891B2,#0E7490);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 14px rgba(8,145,178,0.28);">
              Collecie を使い始める
            </a>
          </div>

          <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-align:center;">
            ご不明な点は <a href="https://www.collecie.com/help" style="color:#0891B2;text-decoration:none;">ヘルプページ</a> をご覧ください。
          </p>
          <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
            バグや改善のご要望は <a href="https://www.collecie.com/settings/feedback" style="color:#0891B2;text-decoration:none;">フィードバックフォーム</a> からどうぞ。
          </p>
        </td></tr>

        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">© 2026 Collecie. All rights reserved.</p>
          <p style="margin:0;font-size:12px;color:#94A3B8;">
            <a href="https://www.collecie.com/terms" style="color:#94A3B8;">利用規約</a>
            &nbsp;·&nbsp;
            <a href="https://www.collecie.com/privacy" style="color:#94A3B8;">プライバシーポリシー</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
