"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

/**
 * 担当店舗（011）。
 *
 * 「担当でない店舗の集金データ・在庫データには一切かかわれない」を担保する。
 *
 * ⚠️ **強制する場所は `getStores()` の 1 か所だけ。** 集金（collectFunds）と
 *    在庫（laundryState）はどちらも自前の `getOrgStoreIds()` から
 *    `getStores()` を呼んでいて、**合計 20 か所以上がそこを通る。**
 *    個々の関数に判定を撒くと必ず撒き漏らすので、入口を絞る。
 *    ⚠️ したがって **`getStores()` を素通りして `laundry_store` を直接引く
 *    経路を新しく作らないこと。** 作った時点でこの機能が無効になる。
 *
 * ⚠️ **BFF（`/api/v1/*`）は Server Action を包んでいるだけ**なので、
 *    ここを絞れば Web とアプリの両方に効く（直接 DB を触るのは
 *    `api/v1/_lib/logNames.js` だけ）。
 */

/** 失敗したときに返す「何も見えない」範囲。⚠️ 開くほうへ倒さない */
const DENY = Object.freeze({ orgId: null, myRole: null, storeIds: [] });

/**
 * 自分が触れる店舗の範囲。
 *
 * `storeIds === null` は **「全店舗」**（admin）。空配列とは意味が違う。
 *
 * ⚠️ **admin は無条件で全店舗。** `member_stores` に admin の行は作らない。
 *    行で表すと、店舗を追加するたびに admin ぶんを足す必要が生まれ、
 *    **足し忘れた瞬間に管理者が自分の店舗を見られなくなる。**
 *
 * ⚠️ **エラーのときは空配列を返す（閉じる）。** 認可の判定なので、
 *    取得に失敗したときに「全部見える」へ倒すと事故になる。
 *
 * ⚠️ `cache()` はリクエスト内でのみ効く。**リクエストをまたいで持ち回らない。**
 */
export const getMyStoreScope = cache(async () => {
  const { user } = await getUser();
  if (!user) return DENY;

  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) return DENY;
  if (member.role === "admin") {
    return { orgId: member.org_id, myRole: "admin", storeIds: null };
  }

  /* 自分の行しか読まないが、RLS を通すと組織の判定が二重になるので service で引く */
  const service = createServiceClient();
  const { data, error: rowsError } = await service
    .from("member_stores")
    .select("laundry_id")
    .eq("org_id", member.org_id)
    .eq("user_id", user.id);

  if (rowsError) {
    console.error("[memberStores] scope の取得に失敗", rowsError);
    return { orgId: member.org_id, myRole: member.role, storeIds: [] };
  }

  return {
    orgId: member.org_id,
    myRole: member.role,
    storeIds: (data ?? []).map((row) => row.laundry_id),
  };
});

/**
 * 組織のメンバー全員の担当店舗。**admin だけが呼べる。**
 *
 * ⚠️ **admin は行を持たない**ので、`laundryIds` は空で返る。
 *    画面側で「全店舗」と出すこと（「未設定」ではない）。
 */
export async function getOrgMemberStores() {
  const scope = await getMyStoreScope();
  if (scope.myRole !== "admin") {
    return { error: "担当店舗を確認できるのは管理者だけです", status: 403 };
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("member_stores")
    .select("user_id, laundry_id")
    .eq("org_id", scope.orgId);

  if (error) return { error: "担当店舗の取得に失敗しました", status: 500 };

  const byUser = {};
  for (const row of data ?? []) {
    (byUser[row.user_id] ??= []).push(row.laundry_id);
  }
  return { data: byUser };
}

/**
 * 1 人の担当店舗を**置き換える**（部分更新ではない）。
 *
 * ⚠️ **admin だけが呼べる。** ここを開けると集金担当者が自分に店舗を
 *    割り当てられるので、この機能そのものが意味を失う。
 *    `member_stores` に書き込みの RLS ポリシーを作っていないのも同じ理由。
 *
 * ⚠️ **`laundryIds` は必ずサーバで検証する。** クライアントが送ってきた id を
 *    そのまま入れると、**他組織の店舗 id を割り当てられる。**
 *
 * ⚠️ **admin には割り当てない。** 常に全店舗なので行が要らない。
 *    誤って作ると、admin から権限を落としたときに古い割り当てが復活する。
 */
export async function setMemberStores(userId, laundryIds) {
  const scope = await getMyStoreScope();
  if (scope.myRole !== "admin") {
    return { error: "担当店舗を変更できるのは管理者だけです", status: 403 };
  }
  if (!userId) return { error: "対象のメンバーが指定されていません", status: 400 };

  const service = createServiceClient();

  /* 対象が同じ組織のメンバーか。⚠️ 他組織の人に割り当てられないようにする */
  const { data: target, error: targetError } = await service
    .from("organization_members")
    .select("role")
    .eq("org_id", scope.orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (targetError) return { error: "メンバーの確認に失敗しました", status: 500 };
  if (!target) return { error: "この組織のメンバーではありません", status: 404 };
  if (target.role === "admin") {
    return { error: "管理者はすべての店舗を担当します", status: 400 };
  }

  /* 組織の店舗だけに絞る。⚠️ 送られてきた id を信じない */
  const { data: stores, error: storesError } = await service
    .from("laundry_store")
    .select("id")
    .eq("organization_id", scope.orgId);

  if (storesError) return { error: "店舗の取得に失敗しました", status: 500 };

  const allowed = new Set((stores ?? []).map((s) => s.id));
  const next = [...new Set(laundryIds ?? [])].filter((id) => allowed.has(id));

  /*
    置き換えなので一度消してから入れる。
    ⚠️ **トランザクションではない。** 消した直後に失敗すると担当が空になる
       （＝その人は何も見えなくなる）。復旧は割り当て直しで済み、
       データは失われないため許容している。逆順（先に入れて後で消す）にすると
       消し漏れが「担当していない店舗が見える」になるので、こちらへ倒す。
  */
  const { error: deleteError } = await service
    .from("member_stores")
    .delete()
    .eq("org_id", scope.orgId)
    .eq("user_id", userId);

  if (deleteError) return { error: "担当店舗の更新に失敗しました", status: 500 };

  if (next.length > 0) {
    const { error: insertError } = await service.from("member_stores").insert(
      next.map((laundryId) => ({
        org_id: scope.orgId,
        user_id: userId,
        laundry_id: laundryId,
      }))
    );
    if (insertError) return { error: "担当店舗の更新に失敗しました", status: 500 };
  }

  return { data: { userId, laundryIds: next } };
}
