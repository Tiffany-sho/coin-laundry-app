import { withAuth, corsPreflight } from "../../_lib/handler";
import { requestJoinOrg } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.adminEmail || !body?.password) {
    return { error: "管理者のメールアドレスと参加パスワードを入力してください", status: 400 };
  }
  const result = await requestJoinOrg(body.adminEmail, body.password);

  /**
   * ⚠️ **パスワードも管理者のメールアドレスも書かない。** 前者は当然として、
   *    後者もログを読める全員に管理者の連絡先を配ることになる。
   *
   * ⚠️ 記録できるのは**参加が成立したあと**だから。logAction は
   *    organization_members から org_id を引くので、ここより前に呼ぶと
   *    まだ所属が無く org_id が null になり、組織のログに出ない。
   */
  if (!result?.error) await logAction("組織に参加しました");
  return result;
});

export const OPTIONS = corsPreflight;
