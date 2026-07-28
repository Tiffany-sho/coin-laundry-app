import { withAuth, corsPreflight } from "../../../_lib/handler";
import {
  updateMemberRole,
  removeMember,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

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
  return await updateMemberRole(userId, body.role);
});

export const DELETE = withAuth(async (request, context) => {
  const { userId } = await context.params;
  return await removeMember(userId);
});

export const OPTIONS = corsPreflight;
