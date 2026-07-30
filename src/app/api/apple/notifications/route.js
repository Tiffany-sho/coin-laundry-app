import { NextResponse } from "next/server";
import { verifyNotification, verifyTransactionIn } from "@/utils/apple/verify";
import {
  applyAppleNotification,
  recordAppleNotification,
} from "@/app/api/supabaseFunctions/supabaseDatabase/billing/appleAction";

export const dynamic = "force-dynamic";

/**
 * App Store Server Notifications V2 の受け口。
 *
 * 更新・失効・返金・プラン変更は**すべてここ経由でしか分からない**。
 * アプリは購入した瞬間しか動かないので、翌月の自動更新や Apple 側での解約を
 * 拾うにはこの URL を App Store Connect に登録しておく必要がある。
 *
 *   App Store Connect > App > 一般 > App 情報 > App Store Server Notifications
 *   本番 URL:   https://www.collecie.com/api/apple/notifications
 *   Sandbox URL: 同上（環境は署名の中に入っているので同じ URL でよい）
 *
 * ⚠️ 認証ヘッダは付かない。**正しさは JWS の署名だけが担保する。**
 *    verifyNotification を通す前のペイロードで DB を触らないこと。
 *
 * ⚠️ 2xx を返さないと Apple が最大 5 回・3 時間かけて再送する。
 *    「処理できなかった」ときだけ 500 を返し、「処理する必要がなかった」ときは
 *    200 を返す。ここを取り違えると同じ通知が延々と再送される。
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    // 形式が壊れているものは再送されても直らない
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const signedPayload = body?.signedPayload;
  if (!signedPayload || typeof signedPayload !== "string") {
    /**
     * ⚠️ **キー名だけ出す。中身は出さない**（取引情報と識別子が入るため）。
     *    App Store Connect で V1 を選んでいると `notification_type` / `unified_receipt`
     *    といった別の形が届く。ここに出るキーを見れば V1 か V2 かが一発で分かる。
     */
    console.error(
      "[apple/notifications] signedPayload が無い。届いたキー:",
      body && typeof body === "object" ? Object.keys(body).join(",") : typeof body
    );
    return NextResponse.json({ error: "missing signedPayload" }, { status: 400 });
  }

  const verified = await verifyNotification(signedPayload);
  if (verified.error) {
    // 署名が通らないものは再送されても通らない
    console.error("[apple/notifications] 署名の検証に失敗:", verified.error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const notification = verified.data;

  // ⚠️ 何が届いたかはここにしか残らない。TEST / SUBSCRIBED / DID_RENEW など
  console.log(
    "[apple/notifications]",
    notification.notificationType,
    notification.subtype ?? "-",
    notification.data?.environment ?? "-"
  );

  // 再送の握りつぶし。ここで false が返る = すでに処理済み
  const record = await recordAppleNotification(notification);
  if (record.error) {
    return NextResponse.json({ error: "record failed" }, { status: 500 });
  }
  if (!record.isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const environment = notification.data?.environment;
  const signedTransactionInfo = notification.data?.signedTransactionInfo;

  // 購読に関係しない通知（テスト送信など）は取引情報を持たない
  if (!signedTransactionInfo) {
    return NextResponse.json({ received: true, handled: false });
  }

  const transaction = await verifyTransactionIn(environment, signedTransactionInfo);
  if (transaction.error) {
    return NextResponse.json({ error: "invalid transaction" }, { status: 400 });
  }

  const result = await applyAppleNotification({
    transaction: transaction.data,
    notification,
  });

  if (result.error) {
    // DB 側の失敗。再送してもらう
    return NextResponse.json({ error: "apply failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, ...result.data });
}
