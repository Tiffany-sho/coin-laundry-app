import { createClient } from "@/utils/supabase/server";

/**
 * アクションログの文面に差し込む名前を DB から引く。
 *
 * ⚠️ **リクエストボディの名前を使わないための存在。** 文面をクライアントに
 *    組み立てさせると「〇〇さんが全店舗を削除しました」のような偽の履歴を
 *    作れる経路になる（docs/ios/06-api-bff.md）。
 *
 * ⚠️ **利用者のクライアント（RLS 下）で引く。** サービスクライアントを使うと
 *    他組織の名前まで引けてしまい、ログ経由で漏れる。
 *
 * ⚠️ **どれも失敗しても例外を投げない。** ログのための取得で本体の操作を
 *    壊してはいけない。引けなければ既定の語（「店舗」「メンバー」）に倒す。
 */

/** 店舗名。⚠️ laundry_state は laundryName を自分で持っている（laundry_store を引かなくてよい） */
export async function laundryNameOf(laundryId) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("laundry_state")
      .select("laundryName")
      .eq("laundryId", laundryId)
      .maybeSingle();
    return data?.laundryName ?? "店舗";
  } catch {
    return "店舗";
  }
}

/**
 * メンバーの表示名。
 *
 * ⚠️ **消す前に呼ぶこと。** 組織から外したあとだと、RLS の都合で
 *    相手の profiles を引けなくなることがある。
 */
export async function memberNameOf(userId) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("username, full_name")
      .eq("id", userId)
      .maybeSingle();
    return data?.username ?? data?.full_name ?? "メンバー";
  } catch {
    return "メンバー";
  }
}

/** ロールの日本語。⚠️ collecter（collector ではない）。docs/contracts.md */
export const ROLE_LABEL = {
  admin: "店舗管理者",
  collecter: "集金担当者",
  viewer: "閲覧者",
};
