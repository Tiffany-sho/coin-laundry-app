import { describe, it, expect } from "vitest";
import { applyDateRange, END_INCLUSIVE, END_EXCLUSIVE } from "./dateRange";
import { getEpochTimeInSeconds } from "./makeDate/date";

// Supabase のクエリビルダを模したスタブ。呼ばれたフィルタを記録する。
function stubQuery() {
  const calls = [];
  const q = {
    calls,
    gt: (col, val) => (calls.push(["gt", col, val]), q),
    gte: (col, val) => (calls.push(["gte", col, val]), q),
    lt: (col, val) => (calls.push(["lt", col, val]), q),
    lte: (col, val) => (calls.push(["lte", col, val]), q),
  };
  return q;
}

const start = getEpochTimeInSeconds(2026, 7, 1);
const end = getEpochTimeInSeconds(2026, 7, 31);

describe("applyDateRange", () => {
  it("開始日は必ず含む（.gte）。.gt だとその日の集金が丸ごと抜ける", () => {
    const q = applyDateRange(stubQuery(), start, null);
    expect(q.calls).toEqual([["gte", "date", start]]);
    expect(q.calls.some(([op]) => op === "gt")).toBe(false);
  });

  it("既定では終了日を含まない（.lt）", () => {
    const q = applyDateRange(stubQuery(), start, end);
    expect(q.calls).toEqual([
      ["gte", "date", start],
      ["lt", "date", end],
    ]);
  });

  it("endMode='inclusive' では終了日を含む（.lte）", () => {
    const q = applyDateRange(stubQuery(), start, end, { endMode: END_INCLUSIVE });
    expect(q.calls).toEqual([
      ["gte", "date", start],
      ["lte", "date", end],
    ]);
  });

  it("endMode='exclusive' を明示しても既定と同じ", () => {
    const q = applyDateRange(stubQuery(), start, end, { endMode: END_EXCLUSIVE });
    expect(q.calls[1]).toEqual(["lt", "date", end]);
  });

  it("null / undefined の境界はフィルタを付けない", () => {
    expect(applyDateRange(stubQuery(), null, null).calls).toEqual([]);
    expect(applyDateRange(stubQuery(), undefined, undefined).calls).toEqual([]);
    expect(applyDateRange(stubQuery(), start, undefined).calls).toEqual([
      ["gte", "date", start],
    ]);
    expect(applyDateRange(stubQuery(), null, end).calls).toEqual([["lt", "date", end]]);
  });

  it("開始日 0（全期間）はフィルタを付ける（0 を null 扱いしない）", () => {
    expect(applyDateRange(stubQuery(), 0, null).calls).toEqual([["gte", "date", 0]]);
  });

  it("月初〜翌月初の指定で、月初の集金が範囲に含まれる", () => {
    const monthStart = getEpochTimeInSeconds(2026, 7, 1);
    const nextMonthStart = getEpochTimeInSeconds(2026, 8, 1);
    const q = applyDateRange(stubQuery(), monthStart, nextMonthStart);

    // 7/1 0:00 のレコードは gte を満たし、8/1 0:00 のレコードは lt で除外される
    const [[, , gteVal], [, , ltVal]] = q.calls;
    expect(monthStart >= gteVal).toBe(true);
    expect(nextMonthStart < ltVal).toBe(false);
  });
});
