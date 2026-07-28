import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getMyOrganization,
  createOrganization,
  updateOrganizationName,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getMyOrganization());

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.name) return { error: "組織名を入力してください", status: 400 };
  return await createOrganization(body.name);
});

export const PATCH = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.name) return { error: "組織名を入力してください", status: 400 };
  return await updateOrganizationName(body.name);
});

export const OPTIONS = corsPreflight;
