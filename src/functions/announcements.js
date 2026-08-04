/**
 * 開発者からのお知らせの表示ロジック（純粋関数）。
 *
 * ⚠️ **iOS アプリ側にも同じ判定がある**（`src/components/settings/announcementsRead.ts`）。
 *    未読の線は「最後に見たお知らせの公開日時」1 つだけで持ち、それより新しいものを
 *    未読とみなす、という決め方を両方で揃えている。片方だけ変えないこと。
 *
 * ⚠️ 保存先は端末ローカル（Web は localStorage / アプリは MMKV）で**サーバには無い。**
 *    ブラウザを変えるとリセットされ、2 台使うと片方だけ既読になる。
 *    正確に持つなら `announcement_reads` テーブルが要る。
 */

/**
 * category ごとの表示名。
 *
 * ⚠️ 増やすときは `docs/ios/migrations/005_announcements.sql` の COMMENT と
 *    iOS の `AnnouncementList.tsx` も直すこと。投稿する人が読むのは Supabase の
 *    Table Editor に出る COMMENT なので、そちらが実質の仕様書になっている。
 */
export const ANNOUNCEMENT_CATEGORIES = {
  info: "お知らせ",
  feature: "新機能",
  maintenance: "メンテナンス",
  incident: "障害",
};

/**
 * 知らない category を既定へ倒す。
 *
 * ⚠️ **DB 側に CHECK 制約が無い**（Table Editor での投稿が失敗しやすくなるため
 *    あえて付けていない）。つまり綴り違いは必ず起こりうる。落とさないこと。
 */
export function categoryOf(value) {
  return Object.prototype.hasOwnProperty.call(ANNOUNCEMENT_CATEGORIES, value)
    ? value
    : "info";
}

/**
 * `published_at` を epoch ミリ秒にそろえる。
 *
 * Server Action は timestamptz を ISO 文字列のまま返し、BFF（アプリ向け）は
 * epoch に畳んで返す。どちらが来ても同じ数値になるようにしてある。
 *
 * ⚠️ ここは JST 深夜 0 時の epoch（`collect_funds.date`）とは**別の話**。
 *    あちらの規約（`dateRange.js`）を持ち込まないこと。
 */
export function toEpochMs(publishedAt) {
  if (typeof publishedAt === "number") {
    return Number.isFinite(publishedAt) ? publishedAt : 0;
  }
  if (typeof publishedAt === "string") {
    const ms = Date.parse(publishedAt);
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

/** 一覧の中で一番新しい公開日時。空なら 0 */
export function latestPublishedAt(items) {
  let latest = 0;
  for (const item of items ?? []) {
    const ms = toEpochMs(item?.published_at ?? item?.publishedAt);
    if (ms > latest) latest = ms;
  }
  return latest;
}

/**
 * 未読とみなす下限。**既読の線と「アカウントを作った時刻」の新しいほう。**
 *
 * ⚠️ **登録より前に公開されたお知らせを未読にしない**（2026-08-05）。
 *    既読の線は端末ローカルで、新規登録した直後は必ず 0。そのままだと
 *    **過去のお知らせが全部未読**になり、初めて開いた画面にいきなり
 *    バッジが付いた状態で始まる。自分が使い始める前の告知なので、
 *    「まだ読んでいない」と言われても意味が無い。
 *
 * ⚠️ **`accountCreatedAt` が無いときは 0 に倒す**＝これまでどおり全部未読。
 *    ここで「今」に倒すと、無い間に公開されたお知らせが**永久に未読にならない。**
 *
 * ⚠️ **iOS アプリ側にも同じ関数がある**（`announcementsRead.ts` の `unreadSince`）。
 *    片方だけ変えると、同じ人が Web とアプリで違う未読件数を見ることになる。
 */
export function unreadSince(lastSeenAt, accountCreatedAt) {
  const line = Number.isFinite(lastSeenAt) ? lastSeenAt : 0;
  const created = toEpochMs(accountCreatedAt);
  return Math.max(line, created);
}

/**
 * 既読の線より新しいものの件数。0 ならバッジを出さない。
 *
 * ⚠️ 第 2 引数には **`unreadSince()` を通した値**を渡すこと。生の `lastSeenAt` を
 *    渡すと、新規登録した人に過去の告知が全部未読として出る。
 */
export function unreadCount(items, lastSeenAt) {
  const line = Number.isFinite(lastSeenAt) ? lastSeenAt : 0;
  let count = 0;
  for (const item of items ?? []) {
    if (toEpochMs(item?.published_at ?? item?.publishedAt) > line) count++;
  }
  return count;
}

/** 1 件が未読か。⚠️ `unreadCount` と同じ線で判定すること（印とバッジがずれる） */
export function isUnread(item, lastSeenAt) {
  const line = Number.isFinite(lastSeenAt) ? lastSeenAt : 0;
  return toEpochMs(item?.published_at ?? item?.publishedAt) > line;
}

/** 一覧に出す日付。JST で「2026/7/31」 */
export function formatAnnouncementDate(publishedAt) {
  const ms = toEpochMs(publishedAt);
  if (ms === 0) return "";
  const d = new Date(ms);
  const jst = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return `${jst.getFullYear()}/${jst.getMonth() + 1}/${jst.getDate()}`;
}
