import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getOrgJoinPassword,
  setOrgJoinPassword,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getOrgJoinPassword());

export const PUT = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  // Web の OrgJoinPasswordCard は「空欄で保存すると削除」なので、
  // password が空文字で来たら消す操作として通す。キー自体が無い場合だけ弾く。
  if (typeof body?.password !== "string") {
    return { error: "参加パスワードを入力してください", status: 400 };
  }
  return await setOrgJoinPassword(body.password);
});

export const OPTIONS = corsPreflight;
