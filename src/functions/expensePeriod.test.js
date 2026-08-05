import { describe, expect, it } from "vitest";
import {
  canGoNext,
  convertCursor,
  currentMonthKey,
  currentYear,
  expensePeriod,
  monthlyTotals,
  shiftCursor,
} from "./expenseSummary";

/**
 * 経費の「月ごと / 年ごと」の算術。
 *
 * ⚠️ **同じ考え方がアプリにもある**（`src/components/expenses/expensePeriod.ts`）。
 *    片方だけ直すと、**同じ組織の同じ月の合計が Web とアプリで食い違う。**
 *    型エラーは出ないので、ここで境界を固定しておく。
 */

/** JST 深夜 0 時の epoch（`expenses.date` と同じ規約） */
const jst = (y, m, d) => Date.UTC(y, m - 1, d) - 32_400_000;
/** epoch → JST の "YYYY-MM-DD HH:mm" */
const iso = (e) => new Date(e + 32_400_000).toISOString().slice(0, 16).replace("T", " ");

describe("expensePeriod", () => {
  it("年は 1/1 から 12/31 まで（⚠️ end は「含む」なので末日そのもの）", () => {
    const y = expensePeriod("year", 2026);
    expect(iso(y.start)).toBe("2026-01-01 00:00");
    expect(iso(y.end)).toBe("2026-12-31 00:00");
    expect(y.label).toBe("2026年");
  });

  it("12 月の終端が年をまたがない", () => {
    const m = expensePeriod("month", "2026-12");
    expect(iso(m.start)).toBe("2026-12-01 00:00");
    expect(iso(m.end)).toBe("2026-12-31 00:00");
  });

  it("年の範囲が 12 か月ぶんをちょうど覆う", () => {
    const y = expensePeriod("year", 2026);
    for (let month = 1; month <= 12; month += 1) {
      const key = `2026-${String(month).padStart(2, "0")}`;
      const m = expensePeriod("month", key);
      expect(m.start).toBeGreaterThanOrEqual(y.start);
      expect(m.end).toBeLessThanOrEqual(y.end);
    }
  });
});

describe("shiftCursor", () => {
  it("月は年をまたいで送れる", () => {
    expect(shiftCursor("month", "2026-12", 1)).toBe("2027-01");
    expect(shiftCursor("month", "2026-01", -1)).toBe("2025-12");
  });

  it("年は西暦をそのまま足し引きする", () => {
    expect(shiftCursor("year", 2026, 1)).toBe(2027);
    expect(shiftCursor("year", 2026, -1)).toBe(2025);
  });
});

describe("convertCursor", () => {
  const now = Date.UTC(2026, 7, 5);

  it("月 → 年 は見ている年を保つ（今年へ飛ばさない）", () => {
    expect(convertCursor("2024-03", "month", "year", now)).toBe(2024);
  });

  it("今年 → 月 は今月（1 月に飛ばすと空の月が出ることが多い）", () => {
    expect(convertCursor(currentYear(now), "year", "month", now)).toBe(currentMonthKey(now));
  });

  it("過去の年 → 月 はその年の 1 月", () => {
    expect(convertCursor(2024, "year", "month", now)).toBe("2024-01");
  });

  it("同じ単位なら値を変えない", () => {
    expect(convertCursor("2026-05", "month", "month", now)).toBe("2026-05");
  });
});

describe("canGoNext", () => {
  const now = Date.UTC(2026, 7, 5);

  it("⚠️ 未来へは送らせない（空の期間を無限にめくれてしまう）", () => {
    expect(canGoNext("month", currentMonthKey(now), now)).toBe(false);
    expect(canGoNext("year", currentYear(now), now)).toBe(false);
  });

  it("過去からは送れる", () => {
    expect(canGoNext("month", "2020-01", now)).toBe(true);
    expect(canGoNext("year", 2020, now)).toBe(true);
  });
});

describe("monthlyTotals", () => {
  it("月ごとに畳んで新しい順に並べる", () => {
    const rows = monthlyTotals([
      { date: jst(2026, 1, 31), amount: 1000 },
      { date: jst(2026, 2, 1), amount: 2000 },
    ]);
    expect(rows.map((r) => r.key)).toEqual(["2026-02", "2026-01"]);
    expect(rows[0].total).toBe(2000);
    expect(rows[1].total).toBe(1000);
  });

  it("⚠️ 欠けた金額は 0 に倒し、欠けた日付の行は落とす（NaN を画面に出さない）", () => {
    const rows = monthlyTotals([
      { date: jst(2026, 2, 1), amount: 2000 },
      { date: jst(2026, 2, 15), amount: undefined },
      { date: undefined, amount: 999 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].total).toBe(2000);
    expect(rows[0].count).toBe(2);
    expect(Number.isFinite(rows[0].total)).toBe(true);
  });

  it("⚠️ JST の月末が翌月に落ちない（epoch は UTC より 9 時間手前）", () => {
    const rows = monthlyTotals([{ date: jst(2026, 1, 31), amount: 1 }]);
    expect(rows[0].key).toBe("2026-01");
  });
});
