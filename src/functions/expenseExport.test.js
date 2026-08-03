import { describe, expect, it } from "vitest";
import { expensesToTable, profitToTable } from "./expenseExport";

/** JST 深夜 0 時の epoch（`expenses.date` / `collect_funds.date` と同じ規約） */
const jst = (y, m, d) => Date.UTC(y, m - 1, d) - 32_400_000;

describe("expensesToTable", () => {
  it("日付・対象・カテゴリ・内容・毎月・金額 の順に並ぶ", () => {
    const { header, rows } = expensesToTable([
      {
        date: jst(2026, 8, 2),
        laundryId: "s1",
        laundryName: "浅草",
        category: "消耗品",
        note: "洗剤",
        amount: 12000,
      },
    ]);
    expect(header).toEqual(["日付", "対象", "カテゴリ", "内容", "毎月", "金額"]);
    expect(rows[0]).toEqual(["2026/08/02", "浅草店", "消耗品", "洗剤", "", 12000]);
  });

  it("⚠️ 月初が前月にならない（JST で読む）", () => {
    const { rows } = expensesToTable([{ date: jst(2026, 8, 1), amount: 1 }]);
    expect(rows[0][0]).toBe("2026/08/01");
  });

  it("laundryId が無い行は「組織全体」", () => {
    const { rows } = expensesToTable([{ date: jst(2026, 8, 2), laundryId: null, amount: 1 }]);
    expect(rows[0][1]).toBe("組織全体");
  });

  it("⚠️ サーバが店名を解決できなかった行だけ「（削除された店舗）」", () => {
    const { rows } = expensesToTable([
      { date: jst(2026, 8, 2), laundryId: "gone", laundryName: null, amount: 1 },
    ]);
    expect(rows[0][1]).toBe("（削除された店舗）");
  });

  it("⚠️ note がカテゴリと同じなら内容を空にする（同じ語が 2 回並ばない）", () => {
    const { rows } = expensesToTable([
      { date: jst(2026, 8, 2), category: "家賃", note: "家賃", amount: 80000 },
    ]);
    expect(rows[0][3]).toBe("");
  });

  it("展開された固定費には「毎月」の印が付く", () => {
    const { rows } = expensesToTable([
      { date: jst(2026, 8, 1), category: "家賃", amount: 80000, recurring: true },
    ]);
    expect(rows[0][4]).toBe("○");
  });

  it("⚠️ 金額が数値でない行を NaN のまま出さない", () => {
    const { rows } = expensesToTable([{ date: jst(2026, 8, 2), amount: undefined }]);
    expect(rows[0][5]).toBe(0);
  });
});

describe("profitToTable", () => {
  const records = [
    { date: jst(2026, 7, 10), totalFunds: 300000 },
    { date: jst(2026, 7, 20), totalFunds: 200000 },
    { date: jst(2026, 8, 5), totalFunds: 100000 },
  ];

  it("月ごとに 売上・経費・利益 を出し、最後に合計行を足す", () => {
    const { header, rows } = profitToTable(records, [
      { date: jst(2026, 7, 15), amount: 100000 },
      { date: jst(2026, 8, 3), amount: 40000 },
    ]);
    expect(header).toEqual(["月", "売上", "経費", "利益", "利益率"]);
    expect(rows[0]).toEqual(["2026年7月", 500000, 100000, 400000, "80%"]);
    expect(rows[1]).toEqual(["2026年8月", 100000, 40000, 60000, "60%"]);
    expect(rows[2]).toEqual(["合計", 600000, 140000, 460000, "76.7%"]);
  });

  it("⚠️ 赤字の月を 0 に丸めない（負のまま出す）", () => {
    const { rows } = profitToTable([{ date: jst(2026, 8, 5), totalFunds: 50000 }], [
      { date: jst(2026, 8, 3), amount: 120000 },
    ]);
    expect(rows[0][3]).toBe(-70000);
    expect(rows[0][4]).toBe("-140%");
  });

  it("⚠️ 売上が 0 の月の利益率は空欄（Infinity% を出さない）", () => {
    const { rows } = profitToTable([], [{ date: jst(2026, 8, 3), amount: 40000 }]);
    expect(rows[0]).toEqual(["2026年8月", 0, 40000, -40000, ""]);
    expect(rows[1][4]).toBe("");
  });

  it("⚠️ 集金が 0 件の月でも経費があれば行が出る（赤字が表から消えない）", () => {
    const { rows } = profitToTable(records, [{ date: jst(2026, 6, 1), amount: 5000 }]);
    expect(rows.map((r) => r[0])).toEqual(["2026年6月", "2026年7月", "2026年8月", "合計"]);
  });

  it("⚠️ 合計の利益率は月ごとの平均ではなく、合計どうしの比で出す", () => {
    // 月ごとの率は 50% と -100%。平均なら -25% だが、合計は 90000/110000
    const { rows } = profitToTable(
      [
        { date: jst(2026, 7, 10), totalFunds: 100000 },
        { date: jst(2026, 8, 10), totalFunds: 10000 },
      ],
      [
        { date: jst(2026, 7, 11), amount: 50000 },
        { date: jst(2026, 8, 11), amount: 20000 },
      ]
    );
    const total = rows[rows.length - 1];
    expect(total).toEqual(["合計", 110000, 70000, 40000, "36.4%"]);
  });

  it("⚠️ 売上は totalFunds（総額）。キャッシュレスを落とさない", () => {
    const { rows } = profitToTable([{ date: jst(2026, 8, 1), totalFunds: 88000 }], []);
    expect(rows[0][1]).toBe(88000);
  });

  it("データが無ければ行も合計も出さない", () => {
    expect(profitToTable([], []).rows).toEqual([]);
  });
});
