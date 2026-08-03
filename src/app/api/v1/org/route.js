import { withAuth, corsPreflight } from "../_lib/handler";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import {
  getMyOrganization,
  createOrganization,
  updateOrganizationName,
  updateOrganizationExpensesEnabled,
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
  /*
    ⚠️ **省略＝経費を使う（true）。** 初期設定で聞いた答えをここで受ける。
       古いアプリは送ってこないので、未指定を false に倒すと
       **アップデート前の端末から作った組織だけ経費が消える。**
  */
  return await createOrganization(body.name, body.expensesEnabled !== false);
});

/**
 * 組織の設定を変える。
 *
 * ⚠️ **1 回に 1 種類だけ反映する**（`PATCH /profile` と同じ流儀）。
 *    `expensesEnabled` を先に見て、あれば組織名は触らない。
 *    まとめて送っても先に当たったものしか効かない。
 */
export const PATCH = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  if (typeof body?.expensesEnabled === "boolean") {
    const result = await updateOrganizationExpensesEnabled(body.expensesEnabled);
    /*
      組織全員の画面が変わる設定なので記録する（通知設定・プロフィールのような
      「個人に閉じた設定」ではない）。⚠️ 文面はサーバで組み立てる。
    */
    if (!result?.error) {
      await logAction(
        body.expensesEnabled
          ? "経費の記録を有効にしました"
          : "経費の記録を無効にしました"
      );
    }
    return result;
  }

  if (!body?.name) return { error: "組織名を入力してください", status: 400 };
  const result = await updateOrganizationName(body.name);
  // 変更後の名前はサーバが受け取った値そのもの（Server Action が検証済み）
  if (!result?.error) await logAction(`組織名を「${body.name}」に変更しました`);
  return result;
});

export const OPTIONS = corsPreflight;
