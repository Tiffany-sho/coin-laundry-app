import { withAuth, corsPreflight } from "../../_lib/handler";
import { requestJoinOrg } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

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
  return await requestJoinOrg(body.adminEmail, body.password);
});

export const OPTIONS = corsPreflight;
