import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getOrganizationInvitations,
  inviteMember,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { sendInviteEmail } from "@/app/api/invite/sendInviteEmail";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.collecie.com";

export const GET = withAuth(async () => await getOrganizationInvitations());

/**
 * メンバー招待。
 *
 * Web の InviteForm は「招待レコード作成 → /api/invite でメール送信」と 2 回呼ぶが、
 * /api/invite は Cookie セッション前提のページから叩かれる想定なので、
 * アプリからは 1 リクエストで済むようここでメール送信まで行う。
 *
 * メール送信に失敗しても招待レコードは有効なので、成功として返しつつ
 * emailSent: false を伝える（アプリ側で「メールは送れませんでした」と出す）。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.email) return { error: "メールアドレスを入力してください", status: 400 };

  const role = body.role ?? "collecter";
  const result = await inviteMember(body.email, role);
  if (result.error) return result;

  const inviteUrl = `${APP_URL}/auth/invite/${result.data.token}`;
  // organizations は多対一の埋め込み。supabase-js のバージョンで
  // オブジェクトにも配列にもなり得るので両方受ける。
  const embedded = result.data.organizations;
  const orgName = (Array.isArray(embedded) ? embedded[0]?.name : embedded?.name) ?? "組織";

  let emailSent = false;
  try {
    const { data: profile } = await getProfile();
    const { error } = await sendInviteEmail({
      email: body.email,
      orgName,
      inviterName: profile?.username ?? "管理者",
      role,
      inviteUrl,
    });
    emailSent = !error;
  } catch (e) {
    console.error("invite mail failed:", e);
  }

  /**
   * ⚠️ **token は絶対に書かない。** 招待リンクそのものなので、ログに残すと
   *    組織の誰でもそのリンクで参加できてしまう。宛先だけにする。
   *
   * ⚠️ 宛先（メールアドレス）は残している。「誰が誰を招待したか」が分からないと
   *    履歴の意味が薄いため。ただし**保留中の招待一覧は admin にしか出していない**のに
   *    ログは組織の全員が読むので、ここだけ可視範囲が広がっている。
   *    嫌なら「新しいメンバーを招待しました」に変える（他のログには影響しない）。
   * ⚠️ 招待は作れてメールだけ失敗することがあるので、その別も残す
   */
  await logAction(
    emailSent
      ? `${body.email} を招待しました`
      : `${body.email} の招待を作成しました（メールは送信できませんでした）`
  );

  return { data: { token: result.data.token, emailSent } };
});

export const OPTIONS = corsPreflight;
