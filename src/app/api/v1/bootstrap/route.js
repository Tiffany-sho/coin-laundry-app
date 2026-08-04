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

  /**
   * アカウントを作った時刻（epoch ミリ秒）。
   *
   * アプリは「登録より前に公開されたお知らせ」を未読にしないためだけに使う。
   *
   * ⚠️ **ISO 文字列のまま返さない。** アプリ側で `new Date(<文字列>)` を通すことになり、
   *    Hermes のパースに寄りかかる（日付が全画面 NaN になった事故と同じ入口。
   *    `docs/ios/…` と アプリの docs/traps.md を参照）。
   * ⚠️ **パースできなければ null。** `Date.parse` は失敗すると NaN を返し、
   *    NaN は JSON で null になるので握り潰されて気づけない。明示的に落とす。
   * ⚠️ DB を引いていない（`auth.users` の情報が `user` に既に入っている）。
   *    クエリを足さないこと。
   */
  const createdAtMs = Date.parse(user.created_at ?? "");

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        createdAt: Number.isFinite(createdAtMs) ? createdAtMs : null,
      },
      profile: profile?.data ?? null,
      organization: organization?.data ?? null,
      plan: plan?.data ?? null,
      collectSchedule: collectSchedule?.data ?? null,
    },
  };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
