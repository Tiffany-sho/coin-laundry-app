import { withAuth, corsPreflight } from "../../_lib/handler";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { getOrgMessagesPage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/**
 * アクションログ（操作履歴）。組織のメンバー全員ぶんを新しい順に返す。
 *
 * orgId は getMyOrganization から引く（アプリに渡させない）。
 *
 * ⚠️ **必ず範囲を切る。** ログは操作のたびに増えるので、切らないと
 *    PostgREST の 1000 行上限に当たって古い順から黙って欠ける。
 */
export const GET = withAuth(async (request, _context, user) => {
  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT)
  );

  const org = await getMyOrganization();
  if (org.error) return org;
  // 組織未所属ならログも無い（403 にはしない。設定画面から普通に開ける）
  if (!org.data?.id) return { data: { items: [], hasMore: false } };

  // 1 件多く取って「次があるか」を判定する（COUNT を別に投げない）
  const result = await getOrgMessagesPage(org.data.id, offset, limit + 1);
  if (result.error) return result;

  const rows = result.data ?? [];
  const hasMore = rows.length > limit;

  /**
   * アプリが依存する形をここで固定する。
   *
   * ⚠️ **`date` は epoch ミリ秒のまま返す。** ISO 文字列にすると端末側で
   *    `new Date(<文字列>)` を通すことになり、Hermes のパースに寄りかかる
   *    （日付が全画面 NaN になった事故と同じ入口。docs/contracts.md）。
   *
   * ⚠️ **`isMe` はサーバで判定する。** 端末で user id を突き合わせても
   *    いいが、そのために生の uuid を配る必要が出る。誰の行かは
   *    表示名と自分かどうかだけ分かれば足りる。
   */
  return {
    data: {
      items: rows.slice(0, limit).map((row) => ({
        id: String(row.id),
        message: row.message ?? "",
        date: row.date ?? null,
        isMe: row.user === user.id,
        // 退会済みユーザーは profiles が引けないので null になる
        username: row.profiles?.username ?? row.profiles?.full_name ?? null,
      })),
      hasMore,
    },
  };
});

export const OPTIONS = corsPreflight;
