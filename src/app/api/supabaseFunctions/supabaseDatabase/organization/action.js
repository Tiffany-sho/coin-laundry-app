"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { getOrgMemberStores } from "../memberStores/action";
import { PLAN_LIMITS, PLAN_MEMBER_LIMITS } from "@/functions/plans";
import { Resend } from "resend";

/**
 * この組織にもう 1 人メンバーを増やせるか。増やせないときだけ文字列を返す。
 *
 * ⚠️ **メンバーが増える経路は 3 つある。**
 *      1. inviteMember      … 招待を作る
 *      2. acceptInvitation  … 招待を受ける（実際に行が増えるのはここ）
 *      3. requestJoinOrg    … 参加パスワードで直接入る
 *    **どれか 1 つでも素通しにすると制限が意味を持たない。**
 *    実際、2026-08-01 まで 3 つとも plan を見ておらず、free でも人数無制限だった。
 *    1 だけ塞いでも 3 が開いているので、必ず 3 か所とも通すこと。
 *
 * ⚠️ **2 でも必ず確認する。** Pro のときに作った招待が残ったまま free へ下がる
 *    ことがあるので、「作れた ＝ 受けられる」ではない。
 *
 * ⚠️ **保留中の招待は数えていない。** free の上限が 1 人（＝オーナーが居る時点で
 *    常に満杯）なので招待自体を作れず、溜まりようがないため。
 *    **Pro に有限の上限を入れるなら、ここで招待の件数も足すこと。**
 *
 * ⚠️ **サービスクライアントで引く。** 呼び出し元のユーザー権限では
 *    organizations を読めないことがある。
 */
async function memberCapacityError(serviceSupabase, orgId) {
  const { data: org } = await serviceSupabase
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .single();

  const plan = org?.plan ?? "free";
  const limit = PLAN_MEMBER_LIMITS[plan] ?? PLAN_MEMBER_LIMITS.free;
  if (limit === Infinity) return null;

  const { count } = await serviceSupabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  if ((count ?? 0) < limit) return null;

  /*
    ⚠️ 文言に外部サイトでの契約を匂わせないこと（App Store Guideline 3.1.3(a)）。
       「プランを変更してください」までに留め、どこで変更するかは書かない。
  */
  return limit === 1
    ? "現在のプランではメンバーを追加できません。プランを変更してください。"
    : `現在のプランのメンバー数の上限（${limit}人）に達しています。プランを変更してください。`;
}

export async function getMyOrganization() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, expenses_enabled)")
    .eq("user_id", user.id)
    .single();

  if (error) return { error: "組織情報の取得に失敗しました" };

  const { expenses_enabled: expensesEnabled, ...org } = data.organizations;
  return {
    data: {
      ...org,
      myRole: data.role,
      /*
        ⚠️ **`!== false` で読む。** 012 より前に作られた行や、列を返さない
           古い応答では undefined になる。`Boolean(undefined)` は false なので、
           素直に畳むと**経費を使っている組織から機能が消える。**
      */
      expensesEnabled: expensesEnabled !== false,
    },
  };
}

/**
 * 組織を作る。
 *
 * ⚠️ **`expensesEnabled` は初期設定で聞いた答え。** 省略＝ true（経費を使う）。
 *    未指定を false に倒すと、Web の古い初期設定フォームから作られた組織で
 *    経費が黙って無効になる。
 */
export async function createOrganization(name, expensesEnabled = true) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .insert({ name, owner_id: user.id, expenses_enabled: expensesEnabled !== false })
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

/**
 * 経費の機能を使うかを切り替える（012）。
 *
 * ⚠️ **これは表示の設定であって認可ではない。** false にしても `expenses` /
 *    `recurring_expenses` の行は消さないし、経費の API も 403 にしない。
 *    戻したときに以前の記録がそのまま出るのが正しい挙動で、
 *    切り替えた瞬間に他の端末が永久に 403 を受け続ける事故も防げる。
 *
 * ⚠️ **admin だけが通す。** 組織全員の画面が変わるため。
 *    ⚠️ `updateOrganizationName` は `owner_id` で絞っているので**オーナーしか
 *       通らない**が、こちらは `setOrgJoinPassword` と同じで admin なら通る。
 *       揃っていないのは意図的（改名はオーナーの権限のまま残してある）。
 */
export async function updateOrganizationExpensesEnabled(enabled) {
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
  const { error } = await serviceSupabase
    .from("organizations")
    // ⚠️ 真偽値に畳んでから入れる。文字列の "false" は DB では true になる
    .update({ expenses_enabled: enabled === true })
    .eq("id", member.org_id);

  if (error) return { error: "更新に失敗しました" };
  return { data: { expensesEnabled: enabled === true } };
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

  /*
    担当店舗（011）を貼る。
    ⚠️ **admin のときだけ引く。** 割り当ての画面は管理者専用で、
       他のメンバーには「誰がどの店舗を担当しているか」を出す画面が無い。
    ⚠️ **admin 自身の storeIds は常に空。** admin は行を持たない（＝全店舗）ので、
       画面では「未設定」ではなく**「全店舗」**と出すこと。取り違えると
       管理者に「担当店舗がありません」と表示される。
  */
  let assignments = {};
  if (myMember.role === "admin") {
    const { data: byUser } = await getOrgMemberStores();
    assignments = byUser ?? {};
  }

  const data = rawData.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    joined_at: row.joined_at,
    storeIds: assignments[row.user_id] ?? [],
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

  // Collecieに登録済みのユーザーかチェック
  const serviceSupabase = createServiceClient();

  // ⚠️ 相手を探す前にプランで弾く。招待メールを送ってから断ると相手が混乱する
  const capacityError = await memberCapacityError(serviceSupabase, myMember.org_id);
  if (capacityError) return { error: capacityError };

  const { data: usersData } = await serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const userExists = usersData?.users?.some((u) => u.email === email);
  if (!userExists) return { error: "このメールアドレスはCollecieに登録されていません。先にアカウントを作成してもらってください。" };

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

  /*
    ⚠️ **作った時点ではなく受ける時点で確認する。** Pro のときに作った招待が
       残ったまま free へ下がっているとここを通ってしまう。
    ⚠️ 招待は消さずに残す。プランを戻せばそのまま使えるほうが親切で、
       期限切れなら既に上で弾かれている。
  */
  const capacityError = await memberCapacityError(supabase, invitation.org_id);
  if (capacityError) return { error: capacityError };

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

  /*
    ⚠️ **ここを忘れると招待を塞いだ意味が無くなる。** 参加パスワードは admin が
       一度配れば誰でも使えるので、招待側だけ止めても人数は増やせてしまう。
    ⚠️ 認証（メール + パスワード）が通った**あと**に置く。先に置くと、
       上限に達している組織かどうかがパスワード無しで分かってしまう。
  */
  const capacityError = await memberCapacityError(serviceSupabase, org.id);
  if (capacityError) return { error: capacityError };

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

  // ⚠️ 課金の出どころ（003_apple_iap.sql で追加した列）は**別のクエリで取る**。
  //    上の select に混ぜると、マイグレーション未適用の環境で 42703 が返って
  //    getOrgPlan ごと失敗し、bootstrap の plan が null になって全画面に響く。
  //    ここが失敗しても「Apple 契約なし」として続行してよい。
  const { data: billing } = await serviceSupabase
    .from("organizations")
    .select("plan_source, apple_product_id, apple_expires_at")
    .eq("id", member.org_id)
    .maybeSingle();

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
      // どこで契約したか。'apple' なら解約は Apple 側でしか行えないので、
      // Web に解約ボタンを出しても機能しない（iOS アプリの表示もここで分岐する）
      planSource: billing?.plan_source ?? null,
      appleProductId: billing?.apple_product_id ?? null,
      appleExpiresAt: billing?.apple_expires_at ?? null,
    },
  };
}

// ─── 組織削除（オーナー専用） ──────────────────────────────────

export async function getMyOrgOwnerDetails() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || !myMember) return { error: "組織に所属していません" };
  if (myMember.role !== "admin") return { error: "権限がありません" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("id, name, owner_id")
    .eq("id", myMember.org_id)
    .single();

  if (orgError || !org) return { error: "組織情報の取得に失敗しました" };
  if (org.owner_id !== user.id) return { error: "オーナーのみアクセスできます" };

  const { count: storeCount } = await serviceSupabase
    .from("laundry_store")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", org.id);

  const { count: memberCount } = await serviceSupabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("org_id", org.id);

  return {
    data: {
      orgName: org.name,
      storeCount: storeCount ?? 0,
      memberCount: memberCount ?? 0,
    },
  };
}

export async function deleteMyOrganization() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: myMember, error: myError } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (myError || !myMember) return { error: "組織に所属していません" };
  if (myMember.role !== "admin") return { error: "権限がありません" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("id, owner_id")
    .eq("id", myMember.org_id)
    .single();

  if (orgError || !org) return { error: "組織情報の取得に失敗しました" };
  if (org.owner_id !== user.id) return { error: "オーナーのみ組織を削除できます" };

  const orgId = myMember.org_id;

  // 店舗IDを取得
  const { data: stores } = await serviceSupabase
    .from("laundry_store")
    .select("id")
    .eq("organization_id", orgId);

  const storeIds = (stores ?? []).map((s) => s.id);

  // 店舗関連データを削除（FK順）
  if (storeIds.length > 0) {
    await serviceSupabase.from("laundry_state").delete().in("laundryId", storeIds);
    await serviceSupabase.from("collect_funds").delete().in("laundryId", storeIds);
    await serviceSupabase.from("laundry_store").delete().in("id", storeIds);
  }

  // 組織関連データを削除
  await serviceSupabase.from("action_message").delete().eq("org_id", orgId);
  await serviceSupabase.from("organization_invitations").delete().eq("org_id", orgId);
  await serviceSupabase.from("organization_members").delete().eq("org_id", orgId);

  const { error: deleteOrgError } = await serviceSupabase
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (deleteOrgError) return { error: "組織の削除に失敗しました" };
  return {};
}
