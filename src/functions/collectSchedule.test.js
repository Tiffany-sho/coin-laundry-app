import { describe, it, expect, afterEach, vi } from "vitest";
import { getNextCollectDate } from "./collectSchedule";

// getNextCollectDate は内部で new Date() を読むため、システム時刻を固定して検証する。
// TZ は vitest.config.mjs で Asia/Tokyo に固定済み。
const freeze = (iso) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${iso}+09:00`));
};

afterEach(() => {
  vi.useRealTimers();
});

describe("getNextCollectDate — 不正な入力", () => {
  it("schedule が null / undefined なら null を返す", () => {
    expect(getNextCollectDate(null)).toBeNull();
    expect(getNextCollectDate(undefined)).toBeNull();
  });

  it("days が配列でない、または空なら null を返す", () => {
    expect(getNextCollectDate({ type: "weekly" })).toBeNull();
    expect(getNextCollectDate({ type: "weekly", days: [] })).toBeNull();
    expect(getNextCollectDate({ type: "weekly", days: "1" })).toBeNull();
  });

  it("未知の type なら null を返す", () => {
    expect(getNextCollectDate({ type: "daily", days: [1] })).toBeNull();
  });
});

describe("getNextCollectDate — weekly", () => {
  it("今日が集金曜日なら daysUntil = 0", () => {
    freeze("2026-07-27T12:00:00"); // 月曜 (dow=1)
    expect(getNextCollectDate({ type: "weekly", days: [1] })).toEqual({ daysUntil: 0 });
  });

  it("今週後半の曜日までの日数を返す", () => {
    freeze("2026-07-27T12:00:00"); // 月曜
    expect(getNextCollectDate({ type: "weekly", days: [5] })).toEqual({ daysUntil: 4 }); // 金曜
    expect(getNextCollectDate({ type: "weekly", days: [0] })).toEqual({ daysUntil: 6 }); // 日曜
  });

  it("過ぎた曜日は翌週に繰り越す", () => {
    freeze("2026-07-31T12:00:00"); // 金曜 (dow=5)
    expect(getNextCollectDate({ type: "weekly", days: [1] })).toEqual({ daysUntil: 3 }); // 次の月曜
  });

  it("複数曜日のうち最も近い日を選ぶ", () => {
    freeze("2026-07-29T12:00:00"); // 水曜 (dow=3)
    expect(getNextCollectDate({ type: "weekly", days: [1, 4, 6] })).toEqual({ daysUntil: 1 }); // 木曜
  });

  it("曜日の並び順に依存しない", () => {
    freeze("2026-07-29T12:00:00"); // 水曜
    const sorted = getNextCollectDate({ type: "weekly", days: [1, 4, 6] });
    const shuffled = getNextCollectDate({ type: "weekly", days: [6, 1, 4] });
    expect(shuffled).toEqual(sorted);
  });

  it("引数の days 配列を破壊しない", () => {
    freeze("2026-07-29T12:00:00");
    const days = [6, 1, 4];
    getNextCollectDate({ type: "weekly", days });
    expect(days).toEqual([6, 1, 4]);
  });
});

describe("getNextCollectDate — monthly", () => {
  it("今日が集金日なら daysUntil = 0", () => {
    freeze("2026-07-27T12:00:00");
    expect(getNextCollectDate({ type: "monthly", days: [27] })).toEqual({ daysUntil: 0 });
  });

  it("今月内の次の集金日までの日数を返す", () => {
    freeze("2026-07-27T12:00:00");
    expect(getNextCollectDate({ type: "monthly", days: [30] })).toEqual({ daysUntil: 3 });
  });

  it("複数日付のうち今日以降で最も近い日を選ぶ", () => {
    freeze("2026-07-27T12:00:00");
    expect(getNextCollectDate({ type: "monthly", days: [5, 15, 28] })).toEqual({ daysUntil: 1 });
  });

  it("今月分を過ぎていたら翌月の最初の集金日を返す", () => {
    freeze("2026-07-27T00:00:00");
    // 7/27 → 8/5 は 9日後（7月は31日まで）
    expect(getNextCollectDate({ type: "monthly", days: [5, 15] })).toEqual({ daysUntil: 9 });
  });

  it("月末から翌月1日へ繰り越す", () => {
    freeze("2026-07-31T00:00:00");
    expect(getNextCollectDate({ type: "monthly", days: [1] })).toEqual({ daysUntil: 1 });
  });

  it("年をまたいで繰り越す", () => {
    freeze("2026-12-20T00:00:00");
    // 12/20 → 1/10 は 21日後
    expect(getNextCollectDate({ type: "monthly", days: [10] })).toEqual({ daysUntil: 21 });
  });

  it("日付の並び順に依存せず、引数を破壊しない", () => {
    freeze("2026-07-27T12:00:00");
    const days = [28, 5, 15];
    expect(getNextCollectDate({ type: "monthly", days })).toEqual({ daysUntil: 1 });
    expect(days).toEqual([28, 5, 15]);
  });
});
