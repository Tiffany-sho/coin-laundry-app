"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

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

  const supabase = await createClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (orgError) return { error: "組織の作成に失敗しました" };

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

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

  if (myError || myMember.role !== "owner") return { error: "権限がありません" };

  const { error } = await supabase
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

  if (myError || myMember.role !== "owner") return { error: "権限がありません" };

  const { error } = await supabase
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

  if (myError || myMember.role !== "owner") return { error: "権限がありません" };

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

  if (myError || myMember.role !== "owner") return { error: "権限がありません" };

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
  const { error } = await supabase
    .from("organization_invitations")
    .delete()
    .eq("id", id);

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
