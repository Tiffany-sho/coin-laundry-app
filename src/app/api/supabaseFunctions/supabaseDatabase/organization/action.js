"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { PLAN_LIMITS } from "@/functions/plans";
import { Resend } from "resend";

export async function getMyOrganization() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name)")
    .eq("user_id", user.id)
    .single();

  if (error) return { error: "組織情報の取得に失敗しました" };
  return { data: { ...data.organizations, myRole: data.role } };
}

export async function createOrganization(name) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (orgError) return { error: "組織の作成に失敗しました" };

  const { error: memberError } = await serviceSupabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "admin" });

  if (memberError) return { error: "メンバー登録に失敗しました" };
  return { data: org };
}

export async function updateOrganizationName(name) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name })
    .eq("owner_id", user.id);

  if (error) return { error: "組織名の更新に失敗しました" };
  return {};
}

export async function getOrganizationMembers() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();

  // SECURITY DEFINER 関数経由で取得（RLS循環参照を回避）
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError) return { error: "組織情報の取得に失敗しました" };

  const { data: rawData, error } = await supabase.rpc("get_org_members");
  if (error) return { error: "メンバー情報の取得に失敗しました" };

  const data = rawData.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    joined_at: row.joined_at,
    profiles: { id: row.user_id, username: row.username, full_name: row.full_name },
  }));

  return { data, orgId: myMember.org_id, myRole: myMember.role };
}

export async function removeMember(userId) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || myMember.role !== "admin") return { error: "権限がありません" };

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase
    .from("organization_members")
    .delete()
    .eq("org_id", myMember.org_id)
    .eq("user_id", userId);

  if (error) return { error: "メンバーの削除に失敗しました" };
  return {};
}

export async function updateMemberRole(userId, role) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || myMember.role !== "admin") return { error: "権限がありません" };

  const VALID_ROLES = ["admin", "collecter", "viewer"];
  if (!VALID_ROLES.includes(role)) return { error: "無効なロールです" };

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase
    .from("organization_members")
    .update({ role })
    .eq("org_id", myMember.org_id)
    .eq("user_id", userId);

  if (error) return { error: "ロールの更新に失敗しました" };
  return {};
}

export async function inviteMember(email, role) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || myMember.role !== "admin") return { error: "権限がありません" };

  if (role === "admin") return { error: "店舗管理者は招待できません。集金担当者または閲覧者を選択してください。" };
  const VALID_ROLES = ["collecter", "viewer"];
  if (!VALID_ROLES.includes(role)) return { error: "無効なロールです" };

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({ org_id: myMember.org_id, email, role, invited_by: user.id, expires_at: expiresAt })
    .select("token, org_id, organizations(name)")
    .single();

  if (error) return { error: "招待の作成に失敗しました" };
  return { data };
}

export async function getOrganizationInvitations() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || myMember.role !== "admin") return { error: "権限がありません" };

  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, email, role, created_at, expires_at, accepted_at, token")
    .eq("org_id", myMember.org_id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: "招待一覧の取得に失敗しました" };
  return { data };
}

export async function deleteInvitation(id) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || myMember.role !== "admin") return { error: "権限がありません" };

  const { error } = await supabase
    .from("organization_invitations")
    .delete()
    .eq("id", id)
    .eq("org_id", myMember.org_id);

  if (error) return { error: "招待の削除に失敗しました" };
  return {};
}

export async function getInvitation(token) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, org_id, email, role, expires_at, accepted_at, organizations(name), profiles!invited_by(username)")
    .eq("token", token)
    .single();

  if (error) return { error: "招待情報の取得に失敗しました" };
  return { data };
}

export async function acceptInvitation(token) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = createServiceClient();
  const { data: invitation, error: invError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (invError || !invitation) return { error: "招待が見つかりません" };
  if (invitation.accepted_at) return { error: "この招待はすでに使用済みです" };
  if (new Date(invitation.expires_at) < new Date()) return { error: "招待の有効期限が切れています" };
  if (invitation.email && user.email !== invitation.email) {
    return { error: "この招待はあなた宛てではありません" };
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ org_id: invitation.org_id, user_id: user.id, role: invitation.role });

  if (memberError) return { error: "組織への参加に失敗しました。すでにメンバーの可能性があります。" };

  await supabase
    .from("organization_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("token", token);

  return {};
}

export async function getCollectSchedule() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (memberError) return { error: "組織情報の取得に失敗しました" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("collect_schedule")
    .eq("id", member.org_id)
    .single();

  if (orgError) return { error: "スケジュールの取得に失敗しました" };
  return { data: org.collect_schedule ?? null };
}

export async function updateCollectSchedule(schedule) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || member.role !== "admin") return { error: "権限がありません" };

  if (schedule !== null) {
    if (!["weekly", "monthly"].includes(schedule.type)) return { error: "無効なスケジュールタイプです" };
    if (!Array.isArray(schedule.days) || schedule.days.length === 0) return { error: "集金日を選択してください" };
    if (schedule.type === "weekly" && schedule.days.some((d) => d < 0 || d > 6)) return { error: "無効な曜日です" };
    if (schedule.type === "monthly" && schedule.days.some((d) => d < 1 || d > 31)) return { error: "無効な日付です" };
  }

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase
    .from("organizations")
    .update({ collect_schedule: schedule })
    .eq("id", member.org_id);

  if (error) return { error: "スケジュールの更新に失敗しました" };
  return {};
}

// ─── 参加パスワード ───────────────────────────────────────────

export async function getOrgJoinPassword() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || member.role !== "admin") return { error: "権限がありません" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("join_password")
    .eq("id", member.org_id)
    .single();

  if (orgError) return { error: "取得に失敗しました" };
  return { data: org.join_password ?? null };
}

export async function setOrgJoinPassword(password) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || member.role !== "admin") return { error: "権限がありません" };

  const value = password && password.trim() !== "" ? password.trim() : null;

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase
    .from("organizations")
    .update({ join_password: value })
    .eq("id", member.org_id);

  if (error) return { error: "更新に失敗しました" };
  return {};
}

export async function requestJoinOrg(adminEmail, joinPassword) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();

  // すでに組織に所属していないか確認
  const { data: existing } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return { error: "すでに組織に所属しています" };

  const serviceSupabase = createServiceClient();

  // 管理者メールアドレスからユーザーを探す
  const { data: usersData, error: listError } = await serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return { error: "ユーザーの検索に失敗しました" };

  const adminAuthUser = usersData?.users?.find((u) => u.email === adminEmail);
  if (!adminAuthUser) return { error: "メールアドレスまたはパスワードが正しくありません" };

  // 管理者の組織と参加パスワードを確認
  const { data: membership, error: memberError } = await serviceSupabase
    .from("organization_members")
    .select("org_id, organizations!inner(id, name, join_password)")
    .eq("user_id", adminAuthUser.id)
    .eq("role", "admin")
    .single();

  if (memberError || !membership) return { error: "メールアドレスまたはパスワードが正しくありません" };

  const org = membership.organizations;
  if (!org.join_password || org.join_password !== joinPassword) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  // 組織に集金担当者として追加
  const { error: addError } = await serviceSupabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "collecter" });

  if (addError) return { error: "組織への参加に失敗しました。すでにメンバーの可能性があります。" };

  // 管理者にメール通知
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .single();
    const displayName = profile?.full_name || profile?.username || user.email;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Collecie <noreply@collecie.com>",
      to: adminEmail,
      subject: `【Collecie】${displayName} さんが ${org.name} に参加しました`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
          <h1 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 8px;">新しいメンバーが参加しました</h1>
          <p style="color: #4a5568; margin-bottom: 16px;">
            <strong>${displayName}</strong> さんが <strong>${org.name}</strong> に集金担当者として参加しました。
          </p>
          <p style="font-size: 13px; color: #a0aec0; margin-top: 24px;">
            Collecie の設定ページからロールの変更や管理ができます。
          </p>
        </div>
      `,
    });
  } catch (_) {
    // メール失敗は参加成功をブロックしない
  }

  return {};
}

// ─────────────────────────────────────────────────────────────

export async function getOrgPlan() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError) return { error: "組織情報の取得に失敗しました" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("plan, stripe_customer_id, stripe_subscription_id, trial_ends_at")
    .eq("id", member.org_id)
    .single();

  if (orgError) return { error: "プラン情報の取得に失敗しました" };

  const { count } = await serviceSupabase
    .from("laundry_store")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", member.org_id);

  const plan = org.plan ?? "free";
  const rawLimit = PLAN_LIMITS[plan];

  return {
    data: {
      plan,
      storeCount: count ?? 0,
      storeLimit: rawLimit === Infinity ? null : rawLimit,
      trialEndsAt: org.trial_ends_at,
      stripeCustomerId: org.stripe_customer_id,
      orgId: member.org_id,
      myRole: member.role,
    },
  };
}
