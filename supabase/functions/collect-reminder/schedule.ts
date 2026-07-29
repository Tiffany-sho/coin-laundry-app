/**
 * 集金日までの日数。
 *
 * ⚠️ **`src/functions/collectSchedule.js` の getNextCollectDate のコピー。**
 *    Edge Function は Deno で動くので Next 側のコードを import できない。
 *    判定を変えるときは必ず両方を同時に直すこと（設計図 4 章のコピー運用）。
 *
 * ⚠️ 本家は `new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }))`
 *    で JST を作っているが、この書き方はロケール文字列の解析に依存していて
 *    ランタイムによって結果が変わる。ここでは UTC+9 の加算で同じ意味を作る。
 *    **結果は本家と一致する**（求めているのは JST の曜日と日付だけ）。
 */

export type CollectSchedule =
  | { type: "weekly"; days: number[] }
  | { type: "monthly"; days: number[] };

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 現在時刻を JST として見た Date（getUTC* で JST の値が取れる） */
export function jstNow(now: number = Date.now()): Date {
  return new Date(now + JST_OFFSET_MS);
}

/** JST の「今何時か」。0〜23。notification_prefs.reminderHour と突き合わせる */
export function jstHour(now: number = Date.now()): number {
  return jstNow(now).getUTCHours();
}

/** JST のその日の 0 時の epoch（ミリ秒）。collect_funds.date と同じ作り方 */
export function jstMidnightEpoch(now: number = Date.now()): number {
  const d = jstNow(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - JST_OFFSET_MS;
}

export function getNextCollectDate(
  schedule: CollectSchedule | null,
  now: number = Date.now()
): { daysUntil: number } | null {
  if (!schedule || !Array.isArray(schedule.days) || schedule.days.length === 0) return null;

  const d = jstNow(now);
  const todayDow = d.getUTCDay(); // 0=日 … 6=土
  const todayDate = d.getUTCDate(); // 1-31

  if (schedule.type === "weekly") {
    const days = [...schedule.days].sort((a, b) => a - b);
    let minDiff = Infinity;
    for (const day of days) {
      let diff = day - todayDow;
      if (diff < 0) diff += 7;
      if (diff < minDiff) minDiff = diff;
    }
    return Number.isFinite(minDiff) ? { daysUntil: minDiff } : null;
  }

  if (schedule.type === "monthly") {
    const days = [...schedule.days].sort((a, b) => a - b);
    for (const day of days) {
      if (day >= todayDate) return { daysUntil: day - todayDate };
    }
    // 今月ぶんは全て過ぎている。来月の最初の集金日まで
    const first = days[0];
    const thisMonth = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const nextMonth = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, first);
    return { daysUntil: Math.round((nextMonth - thisMonth) / 86_400_000) };
  }

  return null;
}
