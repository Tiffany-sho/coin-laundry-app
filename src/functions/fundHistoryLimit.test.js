import { describe, it, expect } from "vitest";
import { MONTHS_PER_PAGE, ROWS_PER_PAGE, initialLimit, limitRows } from "./fundHistory";
import { getEpochTimeInSeconds } from "./makeDate/date";

const epoch = (y, m, d) => getEpochTimeInSeconds(y, m, d);
const row = (y, m, d, total) => ({ date: epoch(y, m, d), totalFunds: total });

describe("initialLimit", () => {
  it("日付順は月数、売上順は件数で刻む", () => {
    expect(initialLimit(true)).toBe(MONTHS_PER_PAGE);
    expect(initialLimit(false)).toBe(ROWS_PER_PAGE);
  });
});

describe("limitRows（売上順・件数で切る）", () => {
  const rows = Array.from({ length: 120 }, (_, i) => row(2026, 1, 1, 1000 - i));

  it("先頭から limit 件だけ出す", () => {
    const { rows: shown, remaining, unit } = limitRows(rows, 50, false);
    expect(shown).toHaveLength(50);
    expect(remaining).toBe(70);
    expect(unit).toBe("row");
  });

  it("全部出し切ったら残りは 0", () => {
    expect(limitRows(rows, 200, false).remaining).toBe(0);
  });

  /*
    ⚠️ **これが本題。** 取得を 2 か月ずつにしていた頃は、この先頭が
       「読み込んだ 2 か月の中の最高額」でしかなかった。
  */
  it("並び順はサーバ側のまま。切り詰めても先頭は変わらない", () => {
    expect(limitRows(rows, 5, false).rows[0]).toBe(rows[0]);
  });
});

describe("limitRows（日付順・月数で切る）", () => {
  const rows = [
    row(2026, 7, 28, 100),
    row(2026, 7, 14, 200),
    row(2026, 6, 20, 300),
    row(2026, 5, 10, 400),
    row(2026, 5, 1, 500),
    row(2026, 2, 3, 600),
  ];

  it("月の数で切る（件数ではない）", () => {
    const { rows: shown, remaining, unit } = limitRows(rows, 2, true);
    // 2026-07 の 2 件 + 2026-06 の 1 件
    expect(shown).toHaveLength(3);
    expect(remaining).toBe(2); // 2026-05 と 2026-02
    expect(unit).toBe("month");
  });

  /*
    ⚠️ 件数で切ると月の途中で切れ、月の見出しの合計とその下の行の和が食い違う。
  */
  it("⚠️ 月の途中で切らない", () => {
    const { rows: shown } = limitRows(rows, 3, true);
    const may = shown.filter((r) => r.date === epoch(2026, 5, 10) || r.date === epoch(2026, 5, 1));
    expect(may).toHaveLength(2);
  });

  it("月が飛んでいても数え間違えない（2026-06 の次が 2026-02）", () => {
    const sparse = [row(2026, 6, 1, 1), row(2026, 2, 1, 2)];
    expect(limitRows(sparse, 1, true).rows).toHaveLength(1);
    expect(limitRows(sparse, 1, true).remaining).toBe(1);
    expect(limitRows(sparse, 2, true).remaining).toBe(0);
  });

  it("月をまたぐ境界（JST 深夜 0 時）を取り違えない", () => {
    // 7/1 の 0 時ちょうどは 7 月。6 月に落とさないこと
    const boundary = [row(2026, 7, 1, 1), row(2026, 6, 30, 2)];
    expect(limitRows(boundary, 1, true).rows).toEqual([boundary[0]]);
  });

  it("空でも落ちない", () => {
    expect(limitRows([], 3, true)).toEqual({ rows: [], remaining: 0, unit: "month" });
    expect(limitRows(null, 3, false)).toEqual({ rows: [], remaining: 0, unit: "row" });
  });
});
