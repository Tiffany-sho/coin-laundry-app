import { describe, expect, it } from "vitest";
import {
  categoryOf,
  formatAnnouncementDate,
  isUnread,
  latestPublishedAt,
  toEpochMs,
  unreadCount,
  unreadSince,
} from "./announcements";

// Server Action は ISO 文字列、BFF は epoch を返す。どちらでも同じ結果になること。
const iso = (s) => ({ published_at: s });
const epoch = (n) => ({ publishedAt: n });

describe("categoryOf", () => {
  it("既知の category はそのまま返す", () => {
    expect(categoryOf("feature")).toBe("feature");
    expect(categoryOf("maintenance")).toBe("maintenance");
    expect(categoryOf("incident")).toBe("incident");
  });

  // DB に CHECK 制約が無いので綴り違いは必ず起こりうる
  it("知らない category は info へ倒す", () => {
    expect(categoryOf("features")).toBe("info");
    expect(categoryOf("")).toBe("info");
    expect(categoryOf(undefined)).toBe("info");
  });

  // Object.prototype 由来のキーを category として拾わないこと
  it("プロトタイプのプロパティ名を既知扱いしない", () => {
    expect(categoryOf("constructor")).toBe("info");
    expect(categoryOf("toString")).toBe("info");
  });
});

describe("toEpochMs", () => {
  it("ISO 文字列と epoch が同じ値になる", () => {
    const ms = Date.UTC(2026, 6, 31, 1, 0, 0);
    expect(toEpochMs(new Date(ms).toISOString())).toBe(ms);
    expect(toEpochMs(ms)).toBe(ms);
  });

  it("壊れた値は 0 にする（未読判定を巻き込んで NaN にしない）", () => {
    expect(toEpochMs("not a date")).toBe(0);
    expect(toEpochMs(null)).toBe(0);
    expect(toEpochMs(undefined)).toBe(0);
    expect(toEpochMs(NaN)).toBe(0);
  });
});

describe("latestPublishedAt", () => {
  it("一番新しい公開日時を返す", () => {
    const items = [
      iso("2026-07-01T00:00:00.000Z"),
      iso("2026-07-31T00:00:00.000Z"),
      iso("2026-07-15T00:00:00.000Z"),
    ];
    expect(latestPublishedAt(items)).toBe(Date.parse("2026-07-31T00:00:00.000Z"));
  });

  it("空・未定義なら 0", () => {
    expect(latestPublishedAt([])).toBe(0);
    expect(latestPublishedAt(undefined)).toBe(0);
  });
});

describe("unreadCount", () => {
  const items = [
    epoch(300),
    epoch(200),
    epoch(100),
  ];

  it("線より新しいものだけ数える", () => {
    expect(unreadCount(items, 0)).toBe(3);
    expect(unreadCount(items, 100)).toBe(2);
    expect(unreadCount(items, 300)).toBe(0);
  });

  // 線とちょうど同じものは既読。ここを > ではなく >= にすると
  // 一覧を開くたびに最新 1 件が未読のまま残る
  it("線とちょうど同じ公開日時は既読とみなす", () => {
    expect(isUnread(epoch(200), 200)).toBe(false);
    expect(isUnread(epoch(201), 200)).toBe(true);
  });

  it("線が未設定でも落ちない", () => {
    expect(unreadCount(items, undefined)).toBe(3);
    expect(unreadCount(items, NaN)).toBe(3);
  });
});

describe("formatAnnouncementDate", () => {
  // 2026-07-31 01:00 UTC = 2026-07-31 10:00 JST
  it("JST の年月日で出す", () => {
    expect(formatAnnouncementDate("2026-07-31T01:00:00.000Z")).toBe("2026/7/31");
  });

  // UTC で前日でも JST では翌日。ここを取り違えると 1 日ずれて見える
  it("UTC 夜は JST の翌日として出す", () => {
    expect(formatAnnouncementDate("2026-07-30T15:00:00.000Z")).toBe("2026/7/31");
  });

  it("壊れた値は空文字（画面に Invalid Date を出さない）", () => {
    expect(formatAnnouncementDate("not a date")).toBe("");
    expect(formatAnnouncementDate(null)).toBe("");
  });
});

describe("unreadSince（登録前のお知らせを未読にしない）", () => {
  const JAN = Date.parse("2026-01-01T00:00:00Z");
  const JUL = Date.parse("2026-07-01T00:00:00Z");
  const AUG = Date.parse("2026-08-01T00:00:00Z");

  it("既読の線が 0 でも、登録より前は未読にしない", () => {
    // 7月に登録した人にとって 1月の告知は「読んでいない」ではなく「関係が無い」
    expect(unreadSince(0, JUL)).toBe(JUL);
    expect(unreadCount([iso("2026-01-01T00:00:00Z")], unreadSince(0, JUL))).toBe(0);
  });

  it("登録より後のお知らせは未読になる", () => {
    expect(unreadCount([epoch(AUG)], unreadSince(0, JUL))).toBe(1);
  });

  it("既読の線のほうが新しければそちらが勝つ", () => {
    expect(unreadSince(AUG, JUL)).toBe(AUG);
    expect(unreadCount([epoch(AUG)], unreadSince(AUG, JUL))).toBe(0);
  });

  /**
   * ⚠️ **無いときは 0（＝全部未読）に倒す。** 「今」に倒すと、値が取れない間に
   *    公開されたお知らせが永久に未読にならない。
   */
  it.each([[null], [undefined], ["", ], ["ではない日付"]])(
    "登録時刻が取れないときは絞らない（%s）",
    (createdAt) => {
      expect(unreadSince(0, createdAt)).toBe(0);
      expect(unreadCount([epoch(JAN)], unreadSince(0, createdAt))).toBe(1);
    }
  );

  it("ISO 文字列でも epoch でも同じ結果になる", () => {
    expect(unreadSince(0, "2026-07-01T00:00:00Z")).toBe(unreadSince(0, JUL));
  });

  it("バッジと『新着』の印が同じ線で判定される", () => {
    // ⚠️ ここがずれると「バッジは 0 なのに一覧に新着の印が残る」
    const line = unreadSince(0, JUL);
    const item = iso("2026-01-01T00:00:00Z");
    expect(unreadCount([item], line)).toBe(0);
    expect(isUnread(item, line)).toBe(false);
  });
});
