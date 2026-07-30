import { withAuth, corsPreflight } from "../_lib/handler";
import { getAnnouncements } from "@/app/api/supabaseFunctions/supabaseDatabase/announcements/action";

export const dynamic = "force-dynamic";

/**
 * 開発者からのお知らせ。組織に関係なく全ユーザー共通。
 *
 * ⚠️ **公開中かつ期限内のものだけが返る**（下書きは出さない）。絞り込みは
 *    Server Action 側にある。RLS でも同じ条件を持たせてあるが、あちらは
 *    サービスクライアントを素通りするので二重に持っている。
 *
 * ⚠️ 投稿は Supabase の Table Editor から手で行う。書き込みの API は作っていない
 *    （作ると、アプリのトークンでお知らせを捏造できる経路が生まれる）。
 */
export const GET = withAuth(async () => {
  const result = await getAnnouncements();
  if (result.error) return result;

  /**
   * ⚠️ **published_at を ISO 文字列のままアプリに渡さない。** 端末側で
   *    `new Date(<文字列>)` を通すことになり、Hermes（実機の JS エンジン）の
   *    パースに寄りかかる形になる。日付が全画面 NaN になった事故と同じ入口なので、
   *    ここで epoch（ミリ秒）に畳んでおく。アプリ側の日付は全部この形で統一してある。
   */
  return {
    data: (result.data ?? []).map((row) => ({
      id: row.id,
      publishedAt: new Date(row.published_at).getTime(),
      category: row.category,
      title: row.title,
      body: row.body,
    })),
  };
});

// web プレビュー用のプリフライト（開発時のみ CORS ヘッダが付く）
export const OPTIONS = corsPreflight;
