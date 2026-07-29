"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { getUser } from "../user/action";

/**
 * プッシュ通知のデバイストークンと通知設定。
 * スキーマは docs/ios/migrations/002_account_and_push.sql。
 */

/** profiles.notification_prefs の既定値。002 の DEFAULT と同じ値にしてある */
const DEFAULT_PREFS = {
  collectReminder: true,
  lowStock: true,
  machineBreak: true,
  reminderHour: 8,
};

/**
 * 端末の Expo プッシュトークンを登録する。
 *
 * ⚠️ **service client を使う。** device_tokens.expo_token は UNIQUE で、同じ端末を
 *    別のユーザーが使い始めた場合（ログアウト → 別アカウントでログイン）は
 *    既存行の user_id を付け替える必要がある。RLS は
 *    `user_id = auth.uid()` なので、ユーザー権限では他人の行を更新できず
 *    23505（重複）で落ちる。
 *
 * ⚠️ enabled を必ず true に戻すこと。DeviceNotRegistered で false に落とした端末が
 *    アプリを開き直したとき、ここで復帰しないと二度と通知が届かない。
 */
export async function registerDeviceToken({ expoToken, platform, appVersion }) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  if (!expoToken || typeof expoToken !== "string") {
    return { error: "トークンが指定されていません", status: 400 };
  }

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase.from("device_tokens").upsert(
    {
      user_id: user.id,
      expo_token: expoToken,
      platform: platform === "android" ? "android" : "ios",
      app_version: appVersion ?? null,
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "expo_token" }
  );

  if (error) {
    console.error("[devices] register failed", error);
    return { error: "通知の登録に失敗しました", status: 500 };
  }

  return { data: { registered: true } };
}

/**
 * トークンを削除する。ログアウト時に呼ぶ。
 *
 * ⚠️ 自分の行だけを消す。トークンは端末ごとの値なので、他人の端末を
 *    消せてしまうと通知を止める攻撃になる。
 */
export async function deleteDeviceToken(expoToken) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  if (!expoToken || typeof expoToken !== "string") {
    return { error: "トークンが指定されていません", status: 400 };
  }

  const serviceSupabase = createServiceClient();
  const { error } = await serviceSupabase
    .from("device_tokens")
    .delete()
    .eq("expo_token", expoToken)
    .eq("user_id", user.id);

  if (error) {
    console.error("[devices] delete failed", error);
    return { error: "通知の解除に失敗しました", status: 500 };
  }

  return { data: { deleted: true } };
}

export async function getNotificationPrefs() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("notification_prefs")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[devices] prefs fetch failed", error);
    return { error: "通知設定の取得に失敗しました" };
  }

  return { data: { ...DEFAULT_PREFS, ...(data?.notification_prefs ?? {}) } };
}

/**
 * 通知設定の部分更新。
 *
 * ⚠️ **jsonb は列ごと置き換わる。** 受け取ったキーだけを書き込むと、
 *    送らなかった項目が消えて既定値に戻る（updateStockState と同じ罠）。
 *    必ず現在値とマージしてから書くこと。
 */
export async function updateNotificationPrefs(patch) {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const current = await getNotificationPrefs();
  if (current.error) return current;

  const next = { ...current.data };

  for (const key of ["collectReminder", "lowStock", "machineBreak"]) {
    if (typeof patch?.[key] === "boolean") next[key] = patch[key];
  }

  if (patch?.reminderHour !== undefined) {
    const hour = Number(patch.reminderHour);
    // 0〜23 以外を入れると Edge Function 側の突き合わせが永久に一致しなくなる
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return { error: "通知時刻の指定が不正です", status: 400 };
    }
    next.reminderHour = hour;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: next })
    .eq("id", user.id);

  if (error) {
    console.error("[devices] prefs update failed", error);
    return { error: "通知設定の保存に失敗しました", status: 500 };
  }

  return { data: next };
}
