"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";
import { getOrgMemberStores } from "../memberStores/action";
import { PLAN_LIMITS, PLAN_MEMBER_LIMITS } from "@/functions/plans";
import { sortMembers } from "@/functions/memberOrder";
import { Resend } from "resend";

/**
 * この組織にもう 1 人メンバーを増やせるか。増やせないときだけ文字列を返す。
 *
 * ⚠️ **メンバーが増える経路は `decideJoinRequest` の承認だけ**（013、2026-08-06）。
 *    それまでは 3 つ（inviteMember / acceptInvitation / requestJoinOrg）あり、
 *    2026-08-01 まで**どれも plan を見ておらず free でも人数無制限だった。**
 *    経路を 1 本にしたので、**呼ぶ場所もここ 1 か所。**
 *    ⚠️ **「メンバーを追加する」経路を新しく作らないこと。** 作った時点で
 *       判定が 2 か所に分かれ、片方を直し忘れる（それが 2026-08-01 の事故そのもの）。
 *
 * ⚠️ **申請の時点では呼ばない。承認の直前に呼ぶ。** 申請が溜まっている間に
 *    プランが下がることも、他の申請を先に承認して埋まることもある。
 *    ⚠️ 申請時に弾くと、**上限に達している組織かどうかが申請しただけで分かる。**
 *
 * ⚠️ **保留中の申請は数えていない。** 行が増えるのは承認のときだけなので、
 *    申請がいくつ溜まっても上限には影響しない。
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
    .select("role, organizations(id, name)")
    .eq("user_id", user.id)
    .single();

  if (error) return { error: "組織情報の取得に失敗しました" };

  /*
    ⚠️ **012 で足した列は「別のクエリ」で取る。上の select に混ぜないこと。**
       混ぜると、マイグレーション未適用の環境で PostgREST が 42703 を返して
       **`getMyOrganization` ごと失敗する。** 呼び出し側はどこも
       `orgResult.data?.myRole ?? "viewer"` と書いているので、
       **店舗管理者が全員 閲覧者になる。** 2026-08-03 に実際にそうなった。
       ⚠️ `getOrgPlan` が 003 のときに同じ理由で同じ形にしてある。**真似ること。**

    ⚠️ ここが失敗しても「経費を使う」として続行してよい（既定と同じ向き）。
  */
  const { data: settings } = await createServiceClient()
    .from("organizations")
    .select("expenses_enabled")
    .eq("id", data.organizations.id)
    .maybeSingle();

  return {
    data: {
      ...data.organizations,
      myRole: data.role,
      /*
        ⚠️ **`!== false` で読む。** 012 より前に作られた行や、列を返せなかった
           ときは undefined になる。`Boolean(undefined)` は false なので、
           素直に畳むと**経費を使っている組織から機能が消える。**
      */
      expensesEnabled: settings?.expenses_enabled !== false,
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
  /*
    ⚠️ **012 の列を insert に混ぜない。** 混ぜると、マイグレーション未適用の
       環境で 42703 が返って**組織の作成そのものが失敗する**（初期設定が
       最後まで進めなくなる）。作ってから別に書く。
    ⚠️ ここが失敗しても既定（true = 経費を使う）で残るだけなので、
       組織の作成は成功させる。
  */
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (orgError) return { error: "組織の作成に失敗しました" };

  /*
    経費を使わない選択のときだけ書き込む。⚠️ **失敗しても続行する**
    （012 未適用なら既定の true と同じ状態になるだけ。組織を作れないほうが困る）。
  */
  if (expensesEnabled === false) {
    await serviceSupabase
      .from("organizations")
      .update({ expenses_enabled: false })
      .eq("id", org.id);
  }

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
 *       通らない**が、こちらは admin なら通る。
 *       揃っていないのは意図的（改名はオーナーの権限のまま残してある）。
 *    ⚠️ 参加申請の承認（013）も `owner_id` で絞っている。**条件が 3 通りある**ので
 *       「admin なら全部できる」と考えないこと。
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

  /*
    ⚠️ **並べるのはここ 1 か所。** Web の組織設定とアプリの組織ページが
       同じこの関数を見ているので、両方に一度で効く。
       **画面ごとに並べ直さないこと**（片方だけ直すと順番が食い違う）。
    ⚠️ 順は 管理者 → 集金担当者 → 閲覧者。同じロールの中は参加が早い順。
  */
  const data = sortMembers(
    rawData.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      role: row.role,
      joined_at: row.joined_at,
      storeIds: assignments[row.user_id] ?? [],
      profiles: { id: row.user_id, username: row.username, full_name: row.full_name },
    }))
  );

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

// ─── 参加申請（013） ─────────────────────────────────────────
//
// ⚠️ **2026-08-06 に経路を 1 本にした。** それまでは 2 つあった:
//    1. メール招待（token 付きリンク）… 相手が未登録だと送れず、
//       届かない・期限切れ・迷惑メール、と詰まりどころが多かった
//    2. 参加パスワード … admin が一度配れば誰でも使える**無期限の合鍵**で、
//       しかも即座にメンバーになれた
//    どちらも撤去し、**従業員が申請 → オーナーが承認**に統一した。
//
// ⚠️ **承認できるのはオーナー（organizations.owner_id）だけ。**
//    メンバーの権限変更・削除は admin 全員なので**条件が違う。** 意図的。

/** 承認時に選べる権限。⚠️ `admin` を入れないこと（オーナーの座を配れてしまう） */
const APPROVABLE_ROLES = ["collecter", "viewer"];

/**
 * 参加を申請する。**入力は管理者のメールアドレスだけ。**
 *
 * ⚠️ **ここでメンバーにしない。** 行が増えるのは `decideJoinRequest` の承認だけ。
 * ⚠️ **プランの上限はここで見ない。** 「増やすとき」に見る規約なので承認側で見る。
 *    ここで弾くと、上限に達している組織かどうかが**申請しただけで分かってしまう。**
 */
export async function requestJoinOrg(adminEmail) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const email = String(adminEmail ?? "").trim();
  if (!email) return { error: "管理者のメールアドレスを入力してください" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return { error: "すでに組織に所属しています" };

  const serviceSupabase = createServiceClient();

  /*
    ⚠️ **見つからないことを隠さない。** 隠すと、打ち間違えた人が
       「申請したのに何も起きない」まま待ち続ける。
       ⚠️ 引き換えに「そのメールが Collecie の管理者か」は分かってしまうが、
          **実際に入れるかは承認が決める**ので、ここは分かるほうを採った。
  */
  const { data: usersData, error: listError } = await serviceSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) return { error: "管理者の検索に失敗しました" };

  const adminAuthUser = usersData?.users?.find((u) => u.email === email);
  if (!adminAuthUser) {
    return { error: "そのメールアドレスの管理者が見つかりませんでした" };
  }

  const { data: membership } = await serviceSupabase
    .from("organization_members")
    .select("org_id, organizations!inner(id, name)")
    .eq("user_id", adminAuthUser.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!membership) {
    return { error: "そのメールアドレスの管理者が見つかりませんでした" };
  }

  const org = membership.organizations;

  /*
    ⚠️ **却下された申請は残っているので `status` で絞る。** 絞らないと
       一度断られた人が二度と申請できない（013 の部分ユニークと同じ考え方）。
  */
  const { data: pending } = await serviceSupabase
    .from("organization_join_requests")
    .select("id")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (pending) return { error: "すでに申請中です。承認をお待ちください。" };

  const { error: insertError } = await serviceSupabase
    .from("organization_join_requests")
    .insert({ org_id: org.id, user_id: user.id, status: "pending" });

  if (insertError) return { error: "申請の送信に失敗しました" };

  /*
    ⚠️ **オーナーに知らせる経路がこれしか無い。** 申請はアプリにも Web にも
       出るが、**見に行かないと気づけない。** 失敗しても申請は成立させる。
    ⚠️ 宛先はオーナーではなく「申請先として入力された管理者」。
       オーナーと同一とは限らないが、**入力された本人には届く。**
  */
  try {
    const { data: profile } = await serviceSupabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", user.id)
      .maybeSingle();
    const displayName = profile?.full_name || profile?.username || "新しいメンバー";

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Collecie <noreply@collecie.com>",
      to: email,
      subject: `【Collecie】${displayName} さんから参加申請が届きました`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
          <h1 style="font-size: 20px; font-weight: bold; color: #1a202c; margin-bottom: 8px;">参加申請が届きました</h1>
          <p style="color: #4a5568; margin-bottom: 16px;">
            <strong>${displayName}</strong> さんが <strong>${org.name}</strong> への参加を申請しました。
          </p>
          <p style="color: #4a5568;">
            設定 → 組織 から、権限を選んで承認してください。
          </p>
          <p style="font-size: 13px; color: #a0aec0; margin-top: 24px;">
            承認できるのは組織のオーナーだけです。
          </p>
        </div>
      `,
    });
  } catch (_) {
    // ⚠️ メールの失敗で申請を失敗させない（申請自体は成立している）
  }

  return { data: { orgName: org.name } };
}

/**
 * 自分が出している申請。組織未所属の画面で「承認待ち」を出すために使う。
 * ⚠️ **無いことは正常。** `null` を返す（`error` にしない）。
 */
export async function getMyJoinRequest() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const serviceSupabase = createServiceClient();
  const { data, error } = await serviceSupabase
    .from("organization_join_requests")
    .select("id, status, created_at, organizations(name)")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error) return { error: "申請の取得に失敗しました" };
  if (!data) return { data: null };

  return {
    data: {
      id: data.id,
      status: data.status,
      orgName: data.organizations?.name ?? null,
      createdAt: new Date(data.created_at).getTime(),
    },
  };
}

/** 申請を取り下げる。⚠️ 自分の pending だけ。承認済みは触らせない */
export async function cancelMyJoinRequest() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const { error } = await createServiceClient()
    .from("organization_join_requests")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return { error: "申請の取り下げに失敗しました" };
  return {};
}

/**
 * 自分の組織に届いている保留中の申請。**オーナーだけ。**
 *
 * ⚠️ **admin には出さない。** 承認できないのに一覧だけ見えると、
 *    「押しても 403 になるボタン」を出すことになる。
 */
export async function getJoinRequests() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const serviceSupabase = createServiceClient();
  const { data: org } = await serviceSupabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  // ⚠️ オーナーでないときは空配列。エラーにすると画面がエラー表示になる
  if (!org) return { data: [] };

  const { data, error } = await serviceSupabase
    .from("organization_join_requests")
    .select("id, created_at, profiles(username, full_name)")
    .eq("org_id", org.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    // ⚠️ 上限を切る。申請は増え続けるので、切らないと 1000 行の壁に当たる
    .limit(100);

  if (error) return { error: "申請一覧の取得に失敗しました" };

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      name: row.profiles?.full_name || row.profiles?.username || "名称未設定",
      createdAt: new Date(row.created_at).getTime(),
    })),
  };
}

/**
 * 申請を承認・却下する。**オーナーだけ。**
 *
 * @param requestId 申請の id
 * @param decision  "approve" | "reject"
 * @param role      承認時の権限。⚠️ `collecter` / `viewer` のみ
 */
export async function decideJoinRequest(requestId, decision, role) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const serviceSupabase = createServiceClient();
  const { data: org } = await serviceSupabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!org) return { error: "オーナーのみ承認できます" };

  /*
    ⚠️ **申請の org_id で絞る。** id だけで引くと、他組織の申請を
       自分の組織へ承認できてしまう。
  */
  const { data: request } = await serviceSupabase
    .from("organization_join_requests")
    .select("id, user_id, status")
    .eq("id", requestId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!request) return { error: "申請が見つかりません" };
  if (request.status !== "pending") return { error: "この申請は処理済みです" };

  if (decision === "reject") {
    const { error } = await serviceSupabase
      .from("organization_join_requests")
      .update({ status: "rejected", decided_at: new Date().toISOString(), decided_by: user.id })
      .eq("id", request.id);
    if (error) return { error: "却下に失敗しました" };
    return { data: { decision: "reject" } };
  }

  if (!APPROVABLE_ROLES.includes(role)) return { error: "無効な権限です" };

  /*
    ⚠️ **承認の直前に上限を見る。** 申請が溜まっている間にプランが下がることも、
       他の申請を先に承認して埋まることもある。「申請できた ＝ 入れる」ではない。
  */
  const capacityError = await memberCapacityError(serviceSupabase, org.id);
  if (capacityError) return { error: capacityError };

  const { error: memberError } = await serviceSupabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: request.user_id, role });

  if (memberError) {
    return { error: "組織への追加に失敗しました。すでにメンバーの可能性があります。" };
  }

  await serviceSupabase
    .from("organization_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString(), decided_by: user.id })
    .eq("id", request.id);

  /*
    ⚠️ **承認後に残っている他組織への pending を消す。** 1 人が複数の組織へ
       申請できるので、放っておくと**すでにメンバーなのに承認できる申請**が残り、
       別のオーナーが承認して失敗する（`organization_members` は 1 人 1 組織）。
  */
  await serviceSupabase
    .from("organization_join_requests")
    .delete()
    .eq("user_id", request.user_id)
    .eq("status", "pending");

  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", request.user_id)
    .maybeSingle();

  return {
    data: {
      decision: "approve",
      role,
      name: profile?.full_name || profile?.username || "名称未設定",
    },
  };
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
