import { withAuth, corsPreflight } from "../_lib/handler";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import {
  getMyOrganization,
  getOrgPlan,
  getCollectSchedule,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

/**
 * 起動時に必要な情報を 1 リクエストにまとめて返す。
 *
 * プロフィール未登録・組織未所属はどちらも正常な状態（初回セットアップ／組織参加へ
 * 進む分岐に使う）なので、個々の Server Action が返す error は握りつぶして null にする。
 * ここで 4xx を返すとアプリが起動できなくなる。
 */
export const GET = withAuth(async (request, context, user) => {
  const [profile, organization, plan, collectSchedule] = await Promise.all([
    getProfile(),
    getMyOrganization(),
    getOrgPlan(),
    getCollectSchedule(),
  ]);

  return {
    data: {
      user: { id: user.id, email: user.email },
      profile: profile?.data ?? null,
      organization: organization?.data ?? null,
      plan: plan?.data ?? null,
      collectSchedule: collectSchedule?.data ?? null,
    },
  };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
