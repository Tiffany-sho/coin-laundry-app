import { withAuth, corsPreflight } from "../../_lib/handler";
import { getJoinRequests } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

/**
 * 自分の組織に届いている保留中の参加申請（013）。
 *
 * ⚠️ **オーナー以外には空配列が返る**（エラーではない）。承認できない人に
 *    一覧だけ見せると、押しても失敗するボタンを出すことになるため。
 * ⚠️ **`profiles` の表示名だけを返す。メールアドレスを載せないこと。**
 *    ログと同じで、可視範囲が広がる。
 */
export const GET = withAuth(async () => await getJoinRequests());

export const OPTIONS = corsPreflight;
