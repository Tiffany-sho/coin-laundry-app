import { describe, it, expect } from "vitest";
import { buildSheets, sanitizeSheetName, SHEET_NAME_MAX } from "./xlsxExport";
import { getEpochTimeInSeconds } from "./makeDate/date";

const epoch = (y, m, d) => getEpochTimeInSeconds(y, m, d);

const record = ({ y, m, d, store, machines = [], total = 0, user = null }) => ({
  date: epoch(y, m, d),
  laundryName: store,
  totalFunds: total,
  fundsArray: machines,
  profiles: user ? { username: user } : null,
});

// Excel のシート名制約は write-excel-file が例外を投げるため、
// ここを通す前に必ず正規化する必要がある（重複だけは例外にならず壊れたブックになる）。
describe("sanitizeSheetName", () => {
  it("問題のない名前はそのまま返す", () => {
    expect(sanitizeSheetName("2026年7月")).toBe("2026年7月");
  });

  it("Excelで使用禁止の文字を置換する", () => {
    expect(sanitizeSheetName("駅前[北口]:店*?/\\")).toBe("駅前-北口--店----");
  });

  it("31文字を超える名前を切り詰める", () => {
    const long = "あ".repeat(40);
    const result = sanitizeSheetName(long);
    expect(result).toHaveLength(SHEET_NAME_MAX);
  });

  it("空・null は Sheet にフォールバックする", () => {
    expect(sanitizeSheetName("")).toBe("Sheet");
    expect(sanitizeSheetName(null)).toBe("Sheet");
    expect(sanitizeSheetName("   ")).toBe("Sheet");
  });

  it("重複した名前には連番を付けて一意化する", () => {
    const used = new Set();
    expect(sanitizeSheetName("本町", used)).toBe("本町");
    expect(sanitizeSheetName("本町", used)).toBe("本町 (2)");
    expect(sanitizeSheetName("本町", used)).toBe("本町 (3)");
  });

  it("31文字ちょうどの名前が重複しても上限を超えない", () => {
    const used = new Set();
    const long = "あ".repeat(SHEET_NAME_MAX);
    const first = sanitizeSheetName(long, used);
    const second = sanitizeSheetName(long, used);
    expect(first).toHaveLength(SHEET_NAME_MAX);
    expect(second.length).toBeLessThanOrEqual(SHEET_NAME_MAX);
    expect(second).not.toBe(first);
  });

  it("禁止文字の置換で同名になった場合も一意化される", () => {
    const used = new Set();
    expect(sanitizeSheetName("A/B", used)).toBe("A-B");
    expect(sanitizeSheetName("A:B", used)).toBe("A-B (2)");
  });
});

describe("buildSheets", () => {
  const data = [
    record({ y: 2026, m: 7, d: 27, store: "本町", total: 100, user: "田中" }),
    record({ y: 2026, m: 6, d: 15, store: "駅前", total: 200, user: "佐藤" }),
    record({ y: 2026, m: 7, d: 3, store: "駅前", total: 300, user: "佐藤" }),
  ];

  it("'period' で年月ごとのシートを古い順に作る", () => {
    const sheets = buildSheets(data, { splitMethod: "period" });
    expect(sheets.map((s) => s.sheet)).toEqual(["2026年6月", "2026年7月"]);
  });

  it("'store' で店舗ごとのシートを作る", () => {
    const sheets = buildSheets(data, { splitMethod: "store" });
    expect(sheets.map((s) => s.sheet)).toEqual(["本町店", "駅前店"]);
  });

  it("各シートはヘッダー行 + データ行で構成される", () => {
    const [june] = buildSheets(data, { splitMethod: "period" });
    expect(june.data).toHaveLength(2); // ヘッダー + 1件
    expect(june.data[0].map((c) => c.value)).toEqual(["日付", "店舗名", "合計", "集金担当者"]);
  });

  it("ヘッダーは太字になる", () => {
    const [june] = buildSheets(data, { splitMethod: "period" });
    expect(june.data[0].every((c) => c.fontWeight === "bold")).toBe(true);
  });

  it("金額は数値セル、日付・店舗名・担当者は文字列セルになる", () => {
    const [june] = buildSheets(data, { splitMethod: "period" });
    const row = june.data[1];
    expect(row[0]).toMatchObject({ value: "2026年6月15日", type: String });
    expect(row[1]).toMatchObject({ value: "駅前店", type: String });
    expect(row[2]).toMatchObject({ value: 200, type: Number });
    expect(row[3]).toMatchObject({ value: "佐藤", type: String });
  });

  it("設備列の金額も数値セルになる", () => {
    const sheets = buildSheets(
      [
        record({
          y: 2026,
          m: 7,
          d: 1,
          store: "本町",
          machines: [{ name: "洗濯機A", funds: 30 }],
          total: 3000,
          user: "田中",
        }),
      ],
      { splitMethod: "period" }
    );
    const row = sheets[0].data[1];
    expect(sheets[0].data[0].map((c) => c.value)).toEqual([
      "日付",
      "店舗名",
      "洗濯機A",
      "合計",
      "集金担当者",
    ]);
    expect(row[2]).toMatchObject({ value: 3000, type: Number });
  });

  it("記録のない設備欄は null（空セル）になる", () => {
    const sheets = buildSheets(
      [
        record({ y: 2026, m: 7, d: 1, store: "本町", machines: [{ name: "洗濯機A", funds: 10 }] }),
        record({ y: 2026, m: 7, d: 2, store: "本町", machines: [{ name: "乾燥機B", funds: 20 }] }),
      ],
      { splitMethod: "period" }
    );
    const [, row1, row2] = sheets[0].data;
    expect(row1[3]).toBeNull(); // 乾燥機B の記録なし
    expect(row2[2]).toBeNull(); // 洗濯機A の記録なし
  });

  it("店舗名が重複しうる場合もシート名が一意になる", () => {
    const sheets = buildSheets(
      [
        record({ y: 2026, m: 7, d: 1, store: "本町/南", total: 100 }),
        record({ y: 2026, m: 7, d: 2, store: "本町:南", total: 200 }),
      ],
      { splitMethod: "store" }
    );
    const names = sheets.map((s) => s.sheet);
    expect(new Set(names).size).toBe(names.length);
  });

  it("空データなら空配列", () => {
    expect(buildSheets([], { splitMethod: "period" })).toEqual([]);
  });
});
