import { withAuth, corsPreflight } from "../../../../_lib/handler";
import { setMemberStores } from "@/app/api/supabaseFunctions/supabaseDatabase/memberStores/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";

export const dynamic = "force-dynamic";

/**
 * 担当店舗の割り当て（011）。**置き換えであって部分更新ではない。**
 *
 * ⚠️ **admin だけが通る。** 判定は `setMemberStores` の中（Server Action が正）。
 *    ここで役割を見ないのは、BFF と Server Action の二重判定がずれるのを避けるため。
 *
 * ⚠️ **一覧は `GET /org/members` に `storeIds` として乗っている。**
 *    ここに GET を足さないこと（メンバー一覧と担当店舗が別々に更新され、
 *    「権限は変えたのに担当が古いまま」という組み合わせが生まれる）。
 */
export const PUT = withAuth(async (request, context) => {
  const { userId } = await context.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  /*
    ⚠️ **配列でなければ空配列に倒す（＝担当を全解除）。** ここで 400 にしない。
       置き換えの API なので「送らない」と「空を送る」は同じ意味にする
       （部分更新だと誤解されると、担当が消えたことに気づけない）。
  */
  const laundryIds = Array.isArray(body?.laundryIds) ? body.laundryIds : [];

  const result = await setMemberStores(userId, laundryIds);
  if (result.error) return result;

  /*
    ⚠️ **店舗名はサーバが引き直す。** body の値を文面に使わない
       （偽の履歴を作れる経路になる）。`getStores` は admin から呼ぶので全店舗が返る。
    ⚠️ 対象者の名前は出さない。⚠️ **0 件にしたことも残す** —
       「何も見えなくなった」ことが後から追えないと問い合わせに答えられない。
  */
  const { data: stores } = await getStores();
  const nameById = new Map((stores ?? []).map((s) => [s.id, s.store]));
  const names = (result.data?.laundryIds ?? []).map((id) => nameById.get(id) ?? "店舗");

  await logAction(
    names.length === 0
      ? "メンバーの担当店舗をすべて解除しました"
      : `メンバーの担当店舗を変更しました（${names.join("・")}）`
  );

  return { data: result.data };
});

export const OPTIONS = corsPreflight;
