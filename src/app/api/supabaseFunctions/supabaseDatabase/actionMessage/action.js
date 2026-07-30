"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "../user/action";

export async function getMessage(id) {
  if (!id) {
    return;
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("action_message")
      .select("*")
      .eq("user", id)
      .order("date", { ascending: false });

    if (error) {
      return {
        error: error,
      };
    }
    return { data: data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

export async function getOrgMessages(orgId) {
  if (!orgId) {
    return { error: { msg: "組織IDが必要です", status: 400 } };
  }

  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  const { data: myMember, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .single();

  if (memberError || !myMember) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  try {
    const { data, error } = await supabase
      .from("action_message")
      .select("*, profiles(username, full_name)")
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (error) {
      return { error };
    }
    return { data };
  } catch (err) {
    return {
      error: { msg: "予期しないエラーが発生しました", status: 400 },
    };
  }
}

/**
 * アクションログを新しい順にページで返す。**アプリ（BFF）はこちらを使う。**
 *
 * ⚠️ getOrgMessages は `.limit()` も `.range()` も付けていないので
 *    **PostgREST の 1000 行上限で黙って打ち切られる**（docs/contracts.md）。
 *    ログは操作のたびに増えるので、Web より先にアプリが上限に当たる。
 *    さらに全件を毎回転送することになるため、アプリでは必ず範囲を切る。
 *
 * 返す形は BFF で整形する前提の生の行（profiles を join 済み）。
 */
export async function getOrgMessagesPage(orgId, offset, limit) {
  if (!orgId) return { error: { msg: "組織IDが必要です", status: 400 } };

  const { user } = await getUser();
  if (!user) return { error: { msg: "ログインしてください", status: 401 } };

  const supabase = await createClient();

  // 他組織の orgId を渡されても引けないよう、所属を確かめてから引く
  const { data: myMember, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (memberError || !myMember) {
    return { error: { msg: "アクセス権限がありません", status: 403 } };
  }

  const { data, error } = await supabase
    .from("action_message")
    .select("id, message, date, user, profiles(username, full_name)")
    .eq("org_id", orgId)
    // ⚠️ date は同じミリ秒で並ぶことがある。id を足さないとページの境目で
    //    行が重複したり飛んだりする（docs/contracts.md の「行数の上限」と同じ話）
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { error };
  return { data };
}

/**
 * 自分のログをページで返す（組織未所属のとき用）。
 * ⚠️ getMessage は範囲を切っていないので 1000 行で打ち切られる。画面はこちらを使う。
 */
export async function getMessagesPage(userId, offset, limit) {
  if (!userId) return { error: { msg: "ユーザーIDが必要です", status: 400 } };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_message")
    .select("id, message, date, user")
    .eq("user", userId)
    // ⚠️ date は同ミリ秒で並ぶことがある。id を足さないとページの境目で行が重複・欠落する
    .order("date", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { error };
  return { data };
}

/**
 * 件数だけ引く。
 *
 * ⚠️ **`head: true` を付けること。** 付けないと行も一緒に返ってきて、
 *    1000 行上限を避けるために分けた意味が無くなる。
 * ⚠️ `count` は上限の影響を受けない（PostgREST が別に数える）ので、
 *    実際の総数がそのまま返る。
 */
export async function countActionMessages({ orgId, userId }) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("action_message")
      .select("id", { count: "exact", head: true });

    query = orgId ? query.eq("org_id", orgId) : query.eq("user", userId);

    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * アクションログを 1 行残す。**BFF（/api/v1/*）からはこれを使う。**
 *
 * createMessage との違いは 2 つだけ:
 *   - **絶対に例外を投げず、失敗しても呼び出し元の処理を壊さない。**
 *     ログが残らなかったからといって集金の登録を失敗にしてはいけない
 *   - 組織が引けなくても諦めずに org_id = null で残す
 *     （createMessage の .single() は未所属だとエラーになる）
 *
 * ⚠️ **message は必ずサーバ側で組み立てること。** リクエストボディの文字列を
 *    そのまま渡すと、アプリから任意の文面のログを作れてしまう
 *    （「〇〇さんが全店舗を削除しました」のような偽の履歴が作れる）。
 *    渡してよいのは DB から引いた値と、この関数の呼び出し側が持つ定型文だけ。
 *
 * ⚠️ RLS は「自分として・自分の組織に」しか INSERT を許さない（006）。
 *    したがってサービスクライアントではなく**利用者のクライアント**で書く。
 */
export async function logAction(message) {
  try {
    const { user } = await getUser();
    if (!user) return;

    const supabase = await createClient();

    // ⚠️ maybeSingle。未所属や複数所属でも例外にしない
    const { data: member } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("action_message").insert({
      message,
      date: Date.now(),
      user: user.id,
      org_id: member?.org_id ?? null,
    });

    if (error) console.error("[action-log]", error.message);
  } catch (e) {
    // ここで throw すると本体の操作まで 500 になる
    console.error("[action-log]", e);
  }
}

export async function createMessage(message) {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "ログインしてください", status: 401 },
    };
  }

  const supabase = await createClient();

  const { data: memberData } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  const date = Date.now();

  const { error } = await supabase.from("action_message").insert({
    message,
    date,
    user: user.id,
    org_id: memberData?.org_id ?? null,
  });

  return { error };
}
