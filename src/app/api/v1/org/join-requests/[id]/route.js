import { withAuth, corsPreflight } from "../../../_lib/handler";
import { decideJoinRequest } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * 参加申請を承認・却下する（013）。**オーナーだけ。**
 *
 * ⚠️ **メンバーが増えるのはここだけ**になった（2026-08-06）。メール招待と
 *    参加パスワードを畳んだので、**プランの人数制限を見る場所もここ 1 か所。**
 *    `decideJoinRequest` の中で `memberCapacityError` を通している。
 *    ⚠️ **別の「メンバーを追加する」経路を作らないこと。** 作った時点で
 *       上限の判定が 2 か所に分かれ、片方を直し忘れる。
 *
 * ⚠️ **文面はサーバが組み立てる**（`result.data.name`）。body の値を
 *    そのまま記録すると、偽の履歴を作れる経路になる。
 * ⚠️ **メールアドレスを書かない。** ログは組織の全員が読む。
 */
export const POST = withAuth(async (request, { params }) => {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const decision = body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    return { error: "decision は approve か reject を指定してください", status: 400 };
  }

  const result = await decideJoinRequest(id, decision, body?.role);
  if (result?.error) return result;

  const label = result.data.role === "viewer" ? "閲覧者" : "集金担当者";
  await logAction(
    decision === "approve"
      ? `${result.data.name} さんの参加を承認しました（${label}）`
      : "参加申請を却下しました"
  );

  return result;
});

export const OPTIONS = corsPreflight;
