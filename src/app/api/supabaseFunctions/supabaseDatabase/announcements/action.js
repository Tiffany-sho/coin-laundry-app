"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

/** 一度に返す上限。お知らせは月に数件なので数年ぶんが入る */
const MAX_ROWS = 50;

/**
 * 開発者からのお知らせ。組織に関係なく全ユーザー共通。
 *
 * ⚠️ **公開中かつ期限内のものだけを返す。** テーブルの RLS でも同じ条件で
 *    絞っているが、ここはサービスクライアントで引く（RLS を素通りする）ので、
 *    **この WHERE が唯一の防波堤**になる。外すと下書きがそのままアプリに出る。
 *
 * ⚠️ サービスクライアントを使う理由は、ログイン直後など RLS の評価に必要な
 *    セッションが揃っていない場面でも同じ結果を返したいため。
 *    認証は下の getUser() で別途確かめている。
 */
export async function getAnnouncements() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, published_at, category, title, body")
    .eq("published", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("published_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    console.error("Announcements fetch error:", error);
    return { error: "お知らせの取得に失敗しました" };
  }
  return { data };
}
