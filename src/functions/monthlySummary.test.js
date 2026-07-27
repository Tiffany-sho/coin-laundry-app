import { describe, it, expect } from "vitest";
import { groupByMonth, computeChanges } from "./monthlySummary";
import { getEpochTimeInSeconds } from "./makeDate/date";

const rec = (y, m, d, totalFunds) => ({ date: getEpochTimeInSeconds(y, m, d), totalFunds });

describe("groupByMonth", () => {
  it("同じ月のレコードを合算する", () => {
    expect(
      groupByMonth([rec(2026, 7, 1, 1000), rec(2026, 7, 20, 2500), rec(2026, 7, 31, 500)])
    ).toEqual([{ key: "2026-07", label: "2026年7月", total: 4000 }]);
  });

  it("入力順に関係なく年月キーの昇順で返す", () => {
    const months = groupByMonth([
      rec(2026, 7, 1, 100),
      rec(2025, 12, 1, 200),
      rec(2026, 2, 1, 300),
    ]);
    expect(months.map((m) => m.key)).toEqual(["2025-12", "2026-02", "2026-07"]);
  });

  it("月初・月末がJST基準で正しい月に入る", () => {
    const months = groupByMonth([rec(2026, 7, 1, 100), rec(2026, 6, 30, 200)]);
    expect(months.map((m) => m.key)).toEqual(["2026-06", "2026-07"]);
    expect(months.map((m) => m.total)).toEqual([200, 100]);
  });

  it("空配列なら空配列", () => {
    expect(groupByMonth([])).toEqual([]);
  });
});

describe("computeChanges", () => {
  it("先頭月は前月比が null", () => {
    const [first] = computeChanges(groupByMonth([rec(2026, 7, 1, 1000)]));
    expect(first.mom).toBeNull();
    expect(first.yoy).toBeNull();
  });

  it("前月比を百分率で計算する", () => {
    const rows = computeChanges(groupByMonth([rec(2026, 6, 1, 1000), rec(2026, 7, 1, 1500)]));
    expect(rows[1].mom).toBeCloseTo(50);
  });

  it("減少はマイナスになる", () => {
    const rows = computeChanges(groupByMonth([rec(2026, 6, 1, 1000), rec(2026, 7, 1, 750)]));
    expect(rows[1].mom).toBeCloseTo(-25);
  });

  it("前年同月が存在すれば前年同月比を計算する", () => {
    const rows = computeChanges(
      groupByMonth([rec(2025, 7, 1, 800), rec(2026, 6, 1, 1000), rec(2026, 7, 1, 1200)])
    );
    const jul2026 = rows.find((r) => r.key === "2026-07");
    expect(jul2026.yoy).toBeCloseTo(50); // 800 -> 1200
  });

  it("前年同月がなければ yoy は null", () => {
    const rows = computeChanges(groupByMonth([rec(2026, 6, 1, 1000), rec(2026, 7, 1, 1200)]));
    expect(rows.every((r) => r.yoy === null)).toBe(true);
  });

  it("比較元が0円なら null（ゼロ除算を避ける）", () => {
    const rows = computeChanges(groupByMonth([rec(2026, 6, 1, 0), rec(2026, 7, 1, 1000)]));
    expect(rows[1].mom).toBeNull();
  });

  it("元の key / label / total を保持する", () => {
    const rows = computeChanges(groupByMonth([rec(2026, 7, 1, 1000)]));
    expect(rows[0]).toMatchObject({ key: "2026-07", label: "2026年7月", total: 1000 });
  });
});
