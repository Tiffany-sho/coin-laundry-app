import { withAuth, corsPreflight } from "../../../_lib/handler";
import {
  updateMemberRole,
  removeMember,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { memberNameOf, ROLE_LABEL } from "../../../_lib/logNames";

export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (request, context) => {
  const { userId } = await context.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!["admin", "collecter", "viewer"].includes(body?.role)) {
    return { error: "権限の指定が不正です", status: 400 };
  }
  const result = await updateMemberRole(userId, body.role);
  if (!result?.error) {
    await logAction(
      `${await memberNameOf(userId)}さんの権限を${ROLE_LABEL[body.role] ?? body.role}に変更しました`
    );
  }
  return result;
});

export const DELETE = withAuth(async (request, context) => {
  const { userId } = await context.params;
  // ⚠️ 名前は**外す前に**引く。組織から外したあとは相手の profiles を引けなくなりうる
  const name = await memberNameOf(userId);
  const result = await removeMember(userId);
  if (!result?.error) await logAction(`${name}さんを組織から削除しました`);
  return result;
});

export const OPTIONS = corsPreflight;
