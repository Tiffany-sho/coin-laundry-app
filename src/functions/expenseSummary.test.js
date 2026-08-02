import { describe, expect, it, vi, afterEach } from "vitest";
import {
  byCategory,
  byStore,
  currentMonthKey,
  formatMonthKey,
  monthKeyFromEpoch,
  monthRange,
  profitOf,
  shiftMonthKey,
  totalAmount,
} from "./expenseSummary";
import { getEpochTimeInSeconds } from "./makeDate/date";

afterEach(() => {
  vi.useRealTimers();
});

describe("monthKeyFromEpoch", () => {
  it("JST の年月を返す", () => {
    expect(monthKeyFromEpoch(getEpochTimeInSeconds(2026, 7, 15))).toBe("2026-07");
  });

  // UTC で読むと月初が前月に落ちる
  it("月初の 0 時でも当月になる", () => {
    expect(monthKeyFromEpoch(getEpochTimeInSeconds(2026, 7, 1))).toBe("2026-07");
  });

  it("大晦日と元日をまたいでも正しい", () => {
    expect(monthKeyFromEpoch(getEpochTimeInSeconds(2026, 12, 31))).toBe("2026-12");
    expect(monthKeyFromEpoch(getEpochTimeInSeconds(2027, 1, 1))).toBe("2027-01");
  });
});

describe("shiftMonthKey", () => {
  it("前後に動かす", () => {
    expect(shiftMonthKey("2026-07", -1)).toBe("2026-06");
    expect(shiftMonthKey("2026-07", 1)).toBe("2026-08");
  });

  it("年をまたぐ", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
  });

  it("12 か月以上ずらせる", () => {
    expect(shiftMonthKey("2026-07", -12)).toBe("2025-07");
    // 2026-07 → +12 で 2027-07 → +6 で 2028-01
    expect(shiftMonthKey("2026-07", 18)).toBe("2028-01");
    expect(shiftMonthKey("2026-07", -18)).toBe("2025-01");
  });
});

describe("currentMonthKey", () => {
  // JST 08/01 00:30 は UTC では 07/31。UTC で読むと前月になる
  it("JST 基準で今月を返す", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T15:30:00.000Z"));
    expect(currentMonthKey()).toBe("2026-08");
  });
});

describe("monthRange", () => {
  // getExpenses の endEpoch は「含む」なので、翌月 1 日を渡すと翌月分が混ざる
  it("終了は末日であって翌月 1 日ではない", () => {
    const { start, end } = monthRange("2026-07");
    expect(start).toBe(getEpochTimeInSeconds(2026, 7, 1));
    expect(end).toBe(getEpochTimeInSeconds(2026, 7, 31));
  });

  it("2 月・12 月も正しい", () => {
    expect(monthRange("2026-02").end).toBe(getEpochTimeInSeconds(2026, 2, 28));
    expect(monthRange("2024-02").end).toBe(getEpochTimeInSeconds(2024, 2, 29));
    expect(monthRange("2026-12").end).toBe(getEpochTimeInSeconds(2026, 12, 31));
  });

  it("末日は当月として読める（範囲の端が翌月へ漏れない）", () => {
    expect(monthKeyFromEpoch(monthRange("2026-07").end)).toBe("2026-07");
  });
});

describe("formatMonthKey", () => {
  it("日本語の年月にする", () => {
    expect(formatMonthKey("2026-07")).toBe("2026年7月");
  });

  it("壊れた値は空文字", () => {
    expect(formatMonthKey("")).toBe("");
    expect(formatMonthKey("xxxx")).toBe("");
  });
});

describe("totalAmount / byCategory / byStore", () => {
  const items = [
    { amount: 1000, category: "仕入れ", laundryId: "s1" },
    { amount: 5000, category: "家賃", laundryId: null, recurring: true },
    { amount: 2000, category: "仕入れ", laundryId: "s2" },
  ];

  it("合計を出す", () => {
    expect(totalAmount(items)).toBe(8000);
    expect(totalAmount([])).toBe(0);
    expect(totalAmount(undefined)).toBe(0);
  });

  // 固定費を除くと家賃を含まない「経費合計」になり収支が合わなくなる
  it("展開した固定費も数える", () => {
    const rows = byCategory(items);
    expect(rows.find((r) => r.category === "家賃").total).toBe(5000);
  });

  it("カテゴリを金額の多い順に畳む", () => {
    const rows = byCategory(items);
    expect(rows[0]).toMatchObject({ category: "家賃", total: 5000, count: 1 });
    expect(rows[1]).toMatchObject({ category: "仕入れ", total: 3000, count: 2 });
  });

  it("店舗ごとに畳み、laundryId が null は組織全体", () => {
    const rows = byStore(items, { s1: "北店", s2: "南店" });
    expect(rows.find((r) => r.laundryId === null).name).toBe("組織全体");
    expect(rows.find((r) => r.laundryId === "s1").name).toBe("北店");
  });

  it("消えた店舗の経費も落とさない", () => {
    const rows = byStore([{ amount: 100, laundryId: "gone" }], {});
    expect(rows[0].name).toBe("（削除された店舗）");
    expect(rows[0].total).toBe(100);
  });
});

describe("profitOf", () => {
  it("利益と利益率を出す", () => {
    expect(profitOf(10000, 4000)).toEqual({ profit: 6000, margin: 60 });
  });

  it("赤字でも出す", () => {
    expect(profitOf(1000, 3000)).toEqual({ profit: -2000, margin: -200 });
  });

  // 経費だけ登録して収益がまだ無い月は普通に起こる
  it("収益 0 なら利益率は null（Infinity を画面に出さない）", () => {
    expect(profitOf(0, 3000)).toEqual({ profit: -3000, margin: null });
  });

  it("未定義でも落ちない", () => {
    expect(profitOf(undefined, undefined)).toEqual({ profit: 0, margin: null });
  });
});
