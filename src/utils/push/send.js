import { createServiceClient } from "@/utils/supabase/service";

/**
 * 組織のメンバーにプッシュ通知を送る。イベント駆動のアラート用。
 *
 * 集金リマインダは毎時の cron なので Supabase Edge Function 側にある
 * （supabase/functions/collect-reminder）。**あちらと役割が違うので統合しない。**
 *
 * ⚠️ **通知の送信で本処理を失敗させないこと。** ここは在庫更新や設備更新の
 *    「ついで」に呼ばれる。Expo が落ちていても在庫の保存は成功扱いにする。
 *    そのため例外は全て握って void を返す。
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
/** Expo は 1 リクエスト 100 件まで */
const CHUNK = 100;

/**
 * @param {object} params
 * @param {string} params.orgId
 * @param {"lowStock"|"machineBreak"} params.prefKey  notification_prefs のどのキーで出し分けるか
 * @param {string} params.title
 * @param {string} params.body
 * @param {string} params.url   タップしたときに開く expo-router のパス
 * @param {string} [params.exceptUserId]  操作した本人。自分の操作の通知は要らない
 */
export async function pushToOrg({ orgId, prefKey, title, body, url, exceptUserId }) {
  try {
    const supabase = createServiceClient();

    const { data: members } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("org_id", orgId);

    const userIds = (members ?? [])
      .map((m) => m.user_id)
      .filter((id) => id !== exceptUserId);

    if (userIds.length === 0) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, notification_prefs")
      .in("id", userIds);

    // 既定は true。設定を一度も触っていないユーザーにも届く
    const wants = (profiles ?? [])
      .filter((p) => (p.notification_prefs ?? {})[prefKey] !== false)
      .map((p) => p.id);

    if (wants.length === 0) return;

    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("expo_token")
      .in("user_id", wants)
      .eq("enabled", true);

    if (!tokens || tokens.length === 0) return;

    const messages = tokens.map((t) => ({
      to: t.expo_token,
      title,
      body,
      sound: "default",
      data: { url, type: prefKey },
    }));

    const invalid = await sendToExpo(messages);

    // 届かなくなった端末を落とす。放置すると毎回送り続ける
    if (invalid.length > 0) {
      await supabase
        .from("device_tokens")
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .in("expo_token", invalid);
    }
  } catch (e) {
    console.error("[push] pushToOrg failed", e);
  }
}

async function sendToExpo(messages) {
  const invalid = [];

  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });

      const json = await response.json();
      const tickets = Array.isArray(json?.data) ? json.data : [];

      tickets.forEach((ticket, index) => {
        if (ticket?.status !== "error") return;
        if (ticket.details?.error === "DeviceNotRegistered") {
          invalid.push(chunk[index].to);
        } else {
          console.error("[push] expo ticket error", ticket.message, ticket.details?.error);
        }
      });
    } catch (e) {
      console.error("[push] expo request failed", e);
    }
  }

  return invalid;
}
