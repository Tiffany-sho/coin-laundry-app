import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  requestJoinOrg,
  getMyJoinRequest,
  cancelMyJoinRequest,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

/**
 * 組織への参加申請（013、2026-08-06）。
 *
 * ⚠️ **参加パスワードは廃止した。** 送るのは管理者のメールアドレスだけ。
 *    ⚠️ **`password` を受け付ける形に戻さないこと。** 合鍵が復活する。
 * ⚠️ **ここではメンバーにならない。** 行が増えるのはオーナーの承認
 *    （`POST /org/join-requests/[id]`）だけ。
 *
 * ⚠️ **アクションログに書かない。** 参加が成立するのは承認のときで、
 *    ここで書くと**組織に入っていない人の操作**になり `org_id` が null になる
 *    （組織のログに出ない行だけが増える）。記録は承認側で行う。
 */
export const GET = withAuth(async () => await getMyJoinRequest());

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.adminEmail) {
    return { error: "管理者のメールアドレスを入力してください", status: 400 };
  }
  return await requestJoinOrg(body.adminEmail);
});

/** 申請の取り下げ。⚠️ 自分の pending だけ（Server Action 側で絞っている） */
export const DELETE = withAuth(async () => await cancelMyJoinRequest());

export const OPTIONS = corsPreflight;
