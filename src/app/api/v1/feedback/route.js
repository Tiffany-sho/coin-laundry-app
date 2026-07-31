import { withAuth, corsPreflight } from "../_lib/handler";
import { sendFeedback } from "@/app/api/supabaseFunctions/feedback/action";

export const dynamic = "force-dynamic";

/** 画面に出している 3 種類だけ。⚠️ 未知の値は Server Action 側でも「その他」に倒れる */
const TYPES = new Set(["bug", "feature", "other"]);

/**
 * フィードバックの送信。Web の /settings/feedback（FeedbackForm）と同じものを
 * アプリから使えるようにする薄いラッパー。
 *
 * ⚠️ **保存先は DB ではなくメール 1 通。** 運営者宛に Resend で送るだけで、
 *    テーブルも管理画面も無い。返信は届いたメールに対して人が行う。
 *
 * ⚠️ **アクションログには残さない。** 送った本人にしか関係しない操作で、
 *    ログは組織の全員が読む（プロフィールや通知設定と同じ扱い）。
 *    ⚠️ さらに本文には要望や不満が入るので、**組織の他メンバーに見せてはいけない。**
 *
 * ⚠️ 本文のエスケープと長さの上限は `sendFeedback` 側にある。
 *    ここで整形しないこと（Web とアプリで挙動が分かれる）。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const description = typeof body?.description === "string" ? body.description : "";
  if (!description.trim()) return { error: "内容を入力してください", status: 400 };

  const type = TYPES.has(body?.type) ? body.type : "other";

  const result = await sendFeedback({ type, description });
  if (result?.error) return { error: result.error, status: 502 };

  return { data: { sent: true } };
});

export const OPTIONS = corsPreflight;
