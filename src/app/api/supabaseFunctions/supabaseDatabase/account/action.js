"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

/**
 * アカウント削除（App Store Guideline 5.1.1(v) 対応）。
 *
 * アプリ内から削除を開始できることが審査の必須要件。現行 Web にあるのは
 * 組織削除だけで auth ユーザーの削除がないため、ここで新規に実装する。
 *
 * ⚠️ 設計判断（設計図 15章 決定事項 1）
 *   過去の集金記録は消さない。組織の売上履歴に穴が開くため、
 *   レコードは残して collecter を NULL にし、UI では「退会済みユーザー」と出す。
 *   そのため collect_funds.collecter が NULL 許容である必要がある（migration 002）。
 */

/** 削除前に「何が消えるか」を利用者に提示するための集計 */
export async function getAccountDeletionSummary() {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    // 組織未所属。消えるのはプロフィールとログイン情報だけ
    return { data: { isOwner: false, orgName: null, storeCount: 0, fundCount: 0 } };
  }

  const serviceSupabase = createServiceClient();
  const { data: org } = await serviceSupabase
    .from("organizations")
    .select("id, name, owner_id")
    .eq("id", member.org_id)
    .single();

  const isOwner = org?.owner_id === user.id;

  // オーナーでなければ組織のデータは消えない（自分が抜けるだけ）
  if (!isOwner) {
    const { count: myFundCount } = await serviceSupabase
      .from("collect_funds")
      .select("*", { count: "exact", head: true })
      .eq("collecter", user.id);

    return {
      data: {
        isOwner: false,
        orgName: org?.name ?? null,
        storeCount: 0,
        fundCount: myFundCount ?? 0,
      },
    };
  }

  const { data: stores } = await serviceSupabase
    .from("laundry_store")
    .select("id")
    .eq("organization_id", member.org_id);

  const storeIds = (stores ?? []).map((s) => s.id);

  let fundCount = 0;
  if (storeIds.length > 0) {
    const { count } = await serviceSupabase
      .from("collect_funds")
      .select("*", { count: "exact", head: true })
      .in("laundryId", storeIds);
    fundCount = count ?? 0;
  }

  return {
    data: {
      isOwner: true,
      orgName: org?.name ?? null,
      storeCount: storeIds.length,
      fundCount,
    },
  };
}

/**
 * アカウントを削除する。
 * 削除順は既存の deleteMyOrganization の FK 順序を踏襲する。
 */
export async function deleteAccount() {
  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member) {
    const { data: org } = await serviceSupabase
      .from("organizations")
      .select("id, owner_id")
      .eq("id", member.org_id)
      .single();

    if (org?.owner_id === user.id) {
      // ① オーナーなら組織ごと削除する（FK 順に注意）
      const orgId = member.org_id;
      const { data: stores } = await serviceSupabase
        .from("laundry_store")
        .select("id")
        .eq("organization_id", orgId);
      const storeIds = (stores ?? []).map((s) => s.id);

      if (storeIds.length > 0) {
        await serviceSupabase.from("laundry_state").delete().in("laundryId", storeIds);
        await serviceSupabase.from("collect_funds").delete().in("laundryId", storeIds);
        await serviceSupabase.from("laundry_store").delete().in("id", storeIds);
      }

      await serviceSupabase.from("action_message").delete().eq("org_id", orgId);
      await serviceSupabase.from("organization_invitations").delete().eq("org_id", orgId);
      await serviceSupabase.from("organization_members").delete().eq("org_id", orgId);

      const { error: orgDeleteError } = await serviceSupabase
        .from("organizations")
        .delete()
        .eq("id", orgId);
      if (orgDeleteError) return { error: "組織の削除に失敗しました" };
    } else {
      // ② オーナー以外は組織から抜けるだけ。
      //    集金記録は組織の資産なので消さず、集金者だけ切り離す
      const { error: detachError } = await serviceSupabase
        .from("collect_funds")
        .update({ collecter: null })
        .eq("collecter", user.id);

      if (detachError) {
        return {
          error:
            "集金記録の引き継ぎに失敗しました。時間をおいて再度お試しください",
        };
      }

      await serviceSupabase
        .from("organization_members")
        .delete()
        .eq("user_id", user.id);
    }
  }

  // ③ プロフィール
  await serviceSupabase.from("profiles").delete().eq("id", user.id);

  // ④ Storage のアバター（失敗しても削除自体は続行する）
  try {
    const { data: files } = await serviceSupabase.storage.from("avatars").list("", {
      search: user.id,
    });
    const targets = (files ?? [])
      .filter((f) => f.name.startsWith(user.id))
      .map((f) => f.name);
    if (targets.length > 0) {
      await serviceSupabase.storage.from("avatars").remove(targets);
    }
  } catch {
    console.error("アバターの削除に失敗しました（処理は続行）");
  }

  // ⑤ 最後に auth ユーザー。ここまで来たら後戻りできない
  const { error: authError } = await serviceSupabase.auth.admin.deleteUser(user.id);
  if (authError) return { error: "アカウントの削除に失敗しました" };

  return { data: { deleted: true } };
}
