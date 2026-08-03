import { describe, expect, it } from "vitest";
import { expensesToTable, groupExpenses, profitToTable } from "./expenseExport";
import { buildSheetsWithExpenses } from "./xlsxExport";
import { groupRecords } from "./exportData";

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
    expect(rows[0]).toEqual(["2026年8月2日", "浅草店", "消耗品", "洗剤", "", 12000]);
  });

  it("⚠️ 月初が前月にならない（JST で読む）", () => {
    const { rows } = expensesToTable([{ date: jst(2026, 8, 1), amount: 1 }]);
    expect(rows[0][0]).toBe("2026年8月1日");
  });

  it("⚠️ 日付の書式が集金データと揃っている（同じシートに縦に並ぶため）", () => {
    const { rows } = expensesToTable([{ date: jst(2026, 8, 2), amount: 1 }]);
    // exportData.js の epochToDateStr と同じ形（"2026年8月2日"）
    expect(rows[0][0]).toBe("2026年8月2日");
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

/* ------------------------------------------------------------------ */
/* 集金データと同じ区別で、同じシートに入る                             */
/* ------------------------------------------------------------------ */

describe("groupExpenses", () => {
  const items = [
    { date: jst(2026, 7, 5), laundryId: "s1", laundryName: "浅草", amount: 1 },
    { date: jst(2026, 8, 5), laundryId: "s2", laundryName: "難波", amount: 2 },
    { date: jst(2026, 8, 6), laundryId: null, amount: 3 },
  ];

  it("⚠️ period のキーは groupRecords と同じ 'YYYY-MM'", () => {
    const mine = groupExpenses(items, "period");
    expect([...mine.keys()].sort()).toEqual(["2026-07", "2026-08"]);

    // 集金側のキーと突き合わせる（ずれると同じ月が別シートに割れる）
    const groups = groupRecords([{ date: jst(2026, 8, 1), laundryName: "浅草" }], "period");
    expect(mine.has(groups[0].key)).toBe(true);
  });

  it("⚠️ store のキーは店名。groupRecords と同じ", () => {
    const mine = groupExpenses(items, "store");
    const groups = groupRecords([{ date: jst(2026, 8, 1), laundryName: "浅草" }], "store");
    expect(mine.has(groups[0].key)).toBe(true);
  });

  it("⚠️ store のとき、組織全体は null キーへ逃がす（捨てない）", () => {
    const mine = groupExpenses(items, "store");
    expect(mine.get(null)).toHaveLength(1);
    expect(mine.get(null)[0].amount).toBe(3);
  });

  it("none は 1 つにまとまる", () => {
    expect(groupExpenses(items, "none").get("all")).toHaveLength(3);
  });
});

describe("buildSheetsWithExpenses", () => {
  const records = [
    { date: jst(2026, 7, 10), laundryName: "浅草", totalFunds: 300000, fundsArray: [] },
    { date: jst(2026, 8, 5), laundryName: "難波", totalFunds: 100000, fundsArray: [] },
  ];

  /** シート内の「■ 経費」ブロックの位置。無ければ -1 */
  const expenseBlockAt = (sheet) =>
    sheet.data.findIndex((row) => row.length === 1 && row[0]?.value === "■ 経費");

  it("経費はその月の集金と同じシートに入る（period）", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 7, 20), laundryId: "s1", laundryName: "浅草", amount: 5000 }],
      { splitMethod: "period" }
    );
    const july = sheets.find((s) => s.sheet === "2026年7月");
    const aug = sheets.find((s) => s.sheet === "2026年8月");

    expect(expenseBlockAt(july)).toBeGreaterThan(0);
    // ⚠️ 経費の無い月にブロックを作らない（空の見出しだけが残る）
    expect(expenseBlockAt(aug)).toBe(-1);
  });

  it("⚠️ 経費は集金の表の「下」に、空行を挟んで入る（列に混ぜない）", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 7, 20), laundryId: "s1", laundryName: "浅草", amount: 5000 }],
      { splitMethod: "period" }
    );
    const july = sheets.find((s) => s.sheet === "2026年7月");
    const at = expenseBlockAt(july);

    // 見出しの 1 つ前は空行
    expect(july.data[at - 1]).toEqual([]);
    // 見出しより前は集金の行だけ（経費の見出し「日付/対象/…」が混ざっていない）
    expect(july.data.slice(0, at - 1).some((r) => r[1]?.value === "対象")).toBe(false);
  });

  it("店舗ごとに分けると、その店舗のシートに入る（store）", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 8, 20), laundryId: "s1", laundryName: "浅草", amount: 5000 }],
      { splitMethod: "store" }
    );
    expect(expenseBlockAt(sheets.find((s) => s.sheet === "浅草店"))).toBeGreaterThan(0);
    expect(expenseBlockAt(sheets.find((s) => s.sheet === "難波店"))).toBe(-1);
  });

  it("⚠️ store のとき、組織全体の経費を落とさず別シートへ逃がす", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 8, 20), laundryId: null, amount: 9000 }],
      { splitMethod: "store" }
    );
    const orphan = sheets.find((s) => s.sheet === "組織全体の経費");
    expect(orphan).toBeDefined();
    expect(orphan.data).toHaveLength(2); // 見出し + 1 行
  });

  it("⚠️ 集金の無い月の経費も落とさない（groupRecords は集金からしか作らない）", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 5, 1), laundryId: "s1", laundryName: "浅草", amount: 7000 }],
      { splitMethod: "period" }
    );
    expect(sheets.some((s) => s.sheet === "その他の経費")).toBe(true);
  });

  it("月別利益は 1 枚だけ独立して付く（期間をまたぐ表なので）", () => {
    const sheets = buildSheetsWithExpenses(
      records,
      [{ date: jst(2026, 7, 20), laundryId: "s1", laundryName: "浅草", amount: 5000 }],
      { splitMethod: "period" }
    );
    expect(sheets.filter((s) => s.sheet === "月別利益")).toHaveLength(1);
  });

  it("経費が 0 件なら集金だけのシートになる（余計なシートを作らない）", () => {
    const sheets = buildSheetsWithExpenses(records, [], { splitMethod: "period" });
    expect(sheets.map((s) => s.sheet)).toEqual(["2026年7月", "2026年8月", "月別利益"]);
  });
});
