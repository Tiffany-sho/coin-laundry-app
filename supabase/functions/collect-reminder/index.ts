import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  getNextCollectDate,
  jstHour,
  jstMidnightEpoch,
  type CollectSchedule,
} from "./schedule.ts";

/**
 * 集金リマインダの送信。**1 時間ごと**に pg_cron から叩かれる。
 *
 * ⚠️ 設計図（10.1）は「毎日 07:50 JST」と書いているが、通知時刻は
 *    profiles.notification_prefs.reminderHour でユーザーごとに変えられるので、
 *    1 日 1 回では守れない。**毎時起動して、その時刻を選んでいる人にだけ送る**。
 *
 * 送るもの:
 *   - daysUntil === 1 … 「明日は集金日です」
 *   - daysUntil === 0 かつ当日の集金が 0 件 … 「今日は集金日です。まだ登録がありません」
 *
 * ⚠️ 在庫アラート・故障アラートはここでは送らない。**イベント駆動**なので
 *    Web 側の状態更新アクション（laundryState/action.js）から送る。
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
/** Expo は 1 リクエスト 100 件まで */
const CHUNK = 100;

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: { url: string; type: "collectReminder" };
};

Deno.serve(async (request) => {
  // ⚠️ 誰でも叩けると通知を無限に飛ばせる。anon キーだけでは足りないので合言葉で守る
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  /**
   * 検証用の空撃ち。`?dryRun=1` で
   *   - 集金日が今日・明日かの絞り込みを外す
   *   - 通知時刻の一致判定を外す
   *   - **Expo へは一切送らない**
   * 各段で何件残るかだけを返す。
   *
   * 本番のスケジュールや通知時刻を一時的に書き換えて確かめる必要をなくすため。
   * ⚠️ 合言葉が要るので誰でも叩けるわけではないが、**送信は絶対に行わないこと**。
   */
  const params = new URL(request.url).searchParams;
  const dryRun = params.get("dryRun") === "1";

  /**
   * 検証用の**本送信**。`?force=1` で dryRun と同じ絞り込みを外したうえで、
   * **実際に Expo へ送る。** 集金日でなくても、通知時刻でなくても、その場で届く。
   *
   * 実機で通知の経路を試すときに、集金予定日を明日に書き換えたり
   * `reminderHour` を今の時刻に合わせたりする必要をなくすため。
   * ⚠️ **本番 APNs は TestFlight / App Store のビルドでしか通らない。**
   *    開発ビルドはサンドボックス APNs で、経路が別物。
   *
   * ⚠️ **合言葉（CRON_SECRET）が要るが、叩けば本物の通知が飛ぶ。**
   *    組織のメンバー全員に届くので、試すときは `?userId=` で絞ること。
   * ⚠️ **`dryRun` と併用したら送らない**（`dryRun` が勝つ）。
   */
  const force = params.get("force") === "1" && !dryRun;

  /**
   * 送る相手を 1 人に絞る（任意）。⚠️ **`force` のときだけ効く。**
   * 通常の定時実行に混ざると、その組織の他のメンバーへ届かなくなる。
   */
  const onlyUserId = force ? params.get("userId") : null;

  /** 日付・時刻・集金済みの判定を飛ばすか。⚠️ 送るかどうかとは別物 */
  const bypassSchedule = dryRun || force;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = Date.now();
  const hour = jstHour(now);
  const todayEpoch = jstMidnightEpoch(now);

  // ① 集金日が設定されている組織
  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, collect_schedule")
    .not("collect_schedule", "is", null);

  if (orgError) {
    console.error("[collect-reminder] orgs", orgError);
    return new Response(JSON.stringify({ error: "orgs" }), { status: 500 });
  }

  // ② 今日・明日が集金日の組織だけに絞る
  const targets: { orgId: string; daysUntil: number }[] = [];
  /**
   * 送らなかったときの内訳。**合言葉を知っている人しか見られない**。
   * これが無いと「スケジュール未設定」と「設定したが 3 日後」を切り分けられず、
   * no_target_org を見て延々と悩むことになる。
   */
  const seen: { daysUntil: number | null; type: string | null }[] = [];

  for (const org of orgs ?? []) {
    const schedule = org.collect_schedule as CollectSchedule | null;
    const next = getNextCollectDate(schedule, now);
    seen.push({ daysUntil: next?.daysUntil ?? null, type: schedule?.type ?? null });
    if (next && (next.daysUntil === 0 || next.daysUntil === 1)) {
      targets.push({ orgId: org.id, daysUntil: next.daysUntil });
    } else if (bypassSchedule && next) {
      // 空撃ち・本送信テストでは日付を問わず通す。⚠️ daysUntil は 0 にすること。
      //    1 にすると「集金済みか」を見るクエリが走らず、そこだけ検証できない
      targets.push({ orgId: org.id, daysUntil: 0 });
    }
  }

  if (targets.length === 0) {
    return new Response(
      JSON.stringify({
        sent: 0,
        reason: "no_target_org",
        // 0 なら「集金スケジュールを設定している組織が 1 つも無い」
        orgsWithSchedule: (orgs ?? []).length,
        // 各組織の「次の集金日まで何日か」。0 か 1 でないと対象にならない
        schedules: seen,
        jstHour: hour,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ③ 当日ぶんは「まだ 1 件も登録が無い」組織にだけ送る
  const todayOrgIds = targets.filter((t) => t.daysUntil === 0).map((t) => t.orgId);
  const alreadyCollected = new Set<string>();

  if (todayOrgIds.length > 0) {
    // ⚠️ **collect_funds に organization_id は無い。** 店舗（laundryId）を経由しないと
    //    組織に辿れない。Web の getOrgCollectFundsInPeriod も同じ引き方をしている。
    //    ここを直接 organization_id で引くと 42703 が返り、エラーを見ていないと
    //    「集金済みの判定が常に空」＝**集金済みでも当日リマインダーが飛ぶ**ことになる。
    const { data: stores, error: storeError } = await supabase
      .from("laundry_store")
      .select("id, organization_id")
      .in("organization_id", todayOrgIds);

    if (storeError) {
      console.error("[collect-reminder] stores", storeError);
      return new Response(JSON.stringify({ error: "stores", detail: storeError.message }), {
        status: 500,
      });
    }

    const orgByStore = new Map((stores ?? []).map((s) => [s.id, s.organization_id]));

    if (orgByStore.size > 0) {
      // ⚠️ collect_funds.date は JST 深夜 0 時の epoch（ミリ秒）。
      //    ここを UTC で組むと日付が 1 日ずれる（docs/contracts.md）
      const { data: funds, error: fundError } = await supabase
        .from("collect_funds")
        .select("laundryId")
        .in("laundryId", [...orgByStore.keys()])
        .gte("date", todayEpoch)
        .lt("date", todayEpoch + 86_400_000);

      if (fundError) {
        console.error("[collect-reminder] funds", fundError);
        return new Response(JSON.stringify({ error: "funds", detail: fundError.message }), {
          status: 500,
        });
      }

      for (const row of funds ?? []) {
        const orgId = orgByStore.get(row.laundryId);
        if (orgId) alreadyCollected.add(orgId);
      }
    }
  }

  // 空撃ち・本送信テストでは絞らない。上のクエリを実際に走らせて壊れていないかだけ確かめる
  // ⚠️ force のときも外す。集金を登録済みだと alreadyCollected で消えて試せなくなる
  const sendable = bypassSchedule
    ? targets
    : targets.filter((t) => t.daysUntil === 1 || !alreadyCollected.has(t.orgId));
  if (sendable.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "already_collected" }), { status: 200 });
  }

  const orgById = new Map(sendable.map((t) => [t.orgId, t]));

  // ④ 対象組織のメンバー
  const { data: members, error: memberError } = await supabase
    .from("organization_members")
    .select("user_id, org_id")
    .in("org_id", [...orgById.keys()]);

  if (memberError) {
    console.error("[collect-reminder] members", memberError);
    return new Response(JSON.stringify({ error: "members", detail: memberError.message }), {
      status: 500,
    });
  }
  if (!members || members.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_members" }), { status: 200 });
  }

  const userIds = [...new Set(members.map((m) => m.user_id))];

  // ⑤ 通知設定。オフの人とこの時刻を選んでいない人を落とす
  //
  // ⚠️ エラーを握らないこと。002 未適用だと notification_prefs 列が無く 42703 が返るが、
  //    握ると profiles が空になり「誰も通知を望んでいない」と区別が付かなくなる
  //    （no_recipient が返って、正常に見えてしまう）
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, notification_prefs")
    .in("id", userIds);

  if (profileError) {
    console.error("[collect-reminder] profiles", profileError);
    return new Response(JSON.stringify({ error: "profiles", detail: profileError.message }), {
      status: 500,
    });
  }

  const wantsNotification = new Set<string>();
  for (const profile of profiles ?? []) {
    const prefs = (profile.notification_prefs ?? {}) as Record<string, unknown>;
    const enabled = prefs.collectReminder !== false; // 既定は true
    const at = typeof prefs.reminderHour === "number" ? prefs.reminderHour : 8;
    if (enabled && (bypassSchedule || at === hour)) wantsNotification.add(profile.id);
  }

  // ⚠️ userId は force のときだけ効く（onlyUserId が null に潰してある）。
  //    定時実行で効くと、その組織の他のメンバーへ届かなくなる
  const recipients = members.filter(
    (m) => wantsNotification.has(m.user_id) && (!onlyUserId || m.user_id === onlyUserId)
  );
  if (recipients.length === 0) {
    return new Response(
      JSON.stringify({
        sent: 0,
        reason: "no_recipient",
        targetOrgs: targets.length,
        members: members.length,
        profiles: (profiles ?? []).length,
        jstHour: hour,
        dryRun,
        force,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ⑥ 端末トークン
  // ⚠️ ここも握らない。002 未適用なら device_tokens テーブル自体が存在しない
  const { data: tokens, error: tokenError } = await supabase
    .from("device_tokens")
    .select("expo_token, user_id")
    .in("user_id", [...new Set(recipients.map((m) => m.user_id))])
    .eq("enabled", true);

  if (tokenError) {
    console.error("[collect-reminder] tokens", tokenError);
    return new Response(JSON.stringify({ error: "tokens", detail: tokenError.message }), {
      status: 500,
    });
  }
  if (!tokens || tokens.length === 0) {
    return new Response(
      JSON.stringify({
        sent: 0,
        reason: "no_token",
        targetOrgs: targets.length,
        recipients: recipients.length,
        alreadyCollected: alreadyCollected.size,
        jstHour: hour,
        dryRun,
        force,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const orgByUser = new Map(recipients.map((m) => [m.user_id, m.org_id]));

  const messages: ExpoMessage[] = [];
  for (const token of tokens) {
    const orgId = orgByUser.get(token.user_id);
    const target = orgId ? orgById.get(orgId) : undefined;
    if (!target) continue;

    messages.push({
      to: token.expo_token,
      title: target.daysUntil === 1 ? "明日は集金日です" : "今日は集金日です",
      body:
        target.daysUntil === 1
          ? "準備をお忘れなく。アプリから店舗を確認できます。"
          : "まだ集金の登録がありません。",
      sound: "default",
      // ⚠️ アプリ側は data.url を expo-router に渡す（src/push/PushProvider.tsx）。
      //    画面のパスを変えたらここも直すこと。存在しないパスでも例外にならず、
      //    タップしても何も起きないだけになる。
      // ⚠️ `(tabs)` はグループなので URL に現れない。ホームは "/"
      data: { url: "/", type: "collectReminder" },
    });
  }

  // ⚠️ 空撃ちはここで打ち切る。Expo を呼ばないこと
  if (dryRun) {
    return new Response(
      JSON.stringify({
        sent: 0,
        reason: "dry_run",
        wouldSend: messages.length,
        targetOrgs: targets.length,
        recipients: recipients.length,
        tokens: tokens.length,
        jstHour: hour,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const invalidTokens = await sendToExpo(messages);

  // ⑦ 届かなくなった端末を落とす。放置すると毎回送り続ける
  if (invalidTokens.length > 0) {
    await supabase
      .from("device_tokens")
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .in("expo_token", invalidTokens);
  }

  return new Response(
    JSON.stringify({ sent: messages.length, disabled: invalidTokens.length, hour }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

/**
 * Expo Push API へ送る。返すのは「もう届かないトークン」。
 *
 * ⚠️ ここで拾えるのは送信直後のエラーだけ。APNs 側の最終結果（レシート）は
 *    別 API を 15 分後などに叩かないと取れない。DeviceNotRegistered の多くは
 *    即座に返るので、まずはこれで十分としている。
 */
async function sendToExpo(messages: ExpoMessage[]): Promise<string[]> {
  const invalid: string[] = [];

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

      tickets.forEach((ticket: Record<string, unknown>, index: number) => {
        if (ticket?.status !== "error") return;
        const details = ticket.details as Record<string, unknown> | undefined;
        if (details?.error === "DeviceNotRegistered") {
          invalid.push(chunk[index].to);
        } else {
          console.error("[collect-reminder] push error", ticket.message, details?.error);
        }
      });
    } catch (e) {
      // 送信失敗はこの回だけ諦める。次の毎時起動で再試行される
      console.error("[collect-reminder] expo request failed", e);
    }
  }

  return invalid;
}
