import { describe, it, expect, afterEach, vi } from "vitest";
import {
  CSV_BOM,
  epochToDateStr,
  epochToYearMonth,
  dateToEpoch,
  toDateInputValue,
  defaultDateRange,
  formatDateSuffix,
  recordsToCsv,
  buildCsvFiles,
} from "./csvExport";
import { getEpochTimeInSeconds } from "./makeDate/date";

const epoch = (y, m, d) => getEpochTimeInSeconds(y, m, d);

// テスト用の集金レコード（Supabase の collect_funds 行を模したもの）
const record = ({ y, m, d, store, machines = [], total = 0, user = null }) => ({
  date: epoch(y, m, d),
  laundryName: store,
  totalFunds: total,
  fundsArray: machines,
  profiles: user ? { username: user } : null,
});

describe("epochToDateStr", () => {
  it("epochを日本語の日付表記に変換する", () => {
    expect(epochToDateStr(epoch(2026, 7, 27))).toBe("2026年7月27日");
    expect(epochToDateStr(epoch(2026, 1, 5))).toBe("2026年1月5日");
  });
});

describe("epochToYearMonth", () => {
  it("ソート用キーと表示用ラベルを返す", () => {
    expect(epochToYearMonth(epoch(2026, 7, 27))).toEqual({
      key: "2026-07",
      label: "2026年7月",
    });
  });

  it("キーはゼロ埋めされ辞書順ソートで時系列になる", () => {
    const keys = [epoch(2026, 12, 1), epoch(2026, 2, 1), epoch(2025, 11, 1)]
      .map((e) => epochToYearMonth(e).key)
      .sort((a, b) => a.localeCompare(b));
    expect(keys).toEqual(["2025-11", "2026-02", "2026-12"]);
  });
});

describe("dateToEpoch / toDateInputValue", () => {
  it("空値には null を返す", () => {
    expect(dateToEpoch("")).toBeNull();
    expect(dateToEpoch(null)).toBeNull();
    expect(dateToEpoch(undefined)).toBeNull();
  });

  it("date input の値をその日の深夜0時のepochに変換する", () => {
    expect(dateToEpoch("2026-07-27")).toBe(epoch(2026, 7, 27));
  });

  it("toDateInputValue は YYYY-MM-DD にゼロ埋めする", () => {
    expect(toDateInputValue(new Date(2026, 6, 5))).toBe("2026-07-05");
    expect(toDateInputValue(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("dateToEpoch と toDateInputValue は往復できる", () => {
    const value = "2026-03-09";
    expect(toDateInputValue(new Date(dateToEpoch(value)))).toBe(value);
  });
});

describe("defaultDateRange / formatDateSuffix", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("デフォルト期間は1か月前〜今日", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T12:00:00+09:00"));
    expect(defaultDateRange()).toEqual({ start: "2026-06-27", end: "2026-07-27" });
  });

  it("ファイル名サフィックスは YYYYMMDD", () => {
    expect(formatDateSuffix(new Date(2026, 6, 5))).toBe("20260705");
    expect(formatDateSuffix(new Date(2026, 11, 31))).toBe("20261231");
  });
});

describe("recordsToCsv", () => {
  it("BOM付きでヘッダー行を出力する", () => {
    const csv = recordsToCsv([
      record({ y: 2026, m: 7, d: 27, store: "本町", total: 12000, user: "田中" }),
    ]);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.slice(CSV_BOM.length).split("\n")[0]).toBe("日付,店舗名,合計,集金担当者");
  });

  it("店舗名に「店」を付け、担当者名を出力する", () => {
    const csv = recordsToCsv([
      record({ y: 2026, m: 7, d: 27, store: "本町", total: 12000, user: "田中" }),
    ]);
    expect(csv.split("\n")[1]).toBe("2026年7月27日,本町店,12000,田中");
  });

  it("設備名を列に横展開し、funds を100倍して円に直す", () => {
    const csv = recordsToCsv([
      record({
        y: 2026,
        m: 7,
        d: 27,
        store: "本町",
        machines: [
          { name: "洗濯機A", funds: 30 },
          { name: "乾燥機B", funds: 12 },
        ],
        total: 4200,
        user: "田中",
      }),
    ]);
    const [header, row] = csv.slice(CSV_BOM.length).split("\n");
    expect(header).toBe("日付,店舗名,洗濯機A,乾燥機B,合計,集金担当者");
    expect(row).toBe("2026年7月27日,本町店,3000,1200,4200,田中");
  });

  it("設備の集合が行ごとに違っても列を揃え、欠けた設備は空欄にする", () => {
    const csv = recordsToCsv([
      record({ y: 2026, m: 7, d: 1, store: "本町", machines: [{ name: "洗濯機A", funds: 10 }] }),
      record({ y: 2026, m: 7, d: 2, store: "本町", machines: [{ name: "乾燥機B", funds: 20 }] }),
    ]);
    const [header, row1, row2] = csv.slice(CSV_BOM.length).split("\n");
    expect(header).toBe("日付,店舗名,洗濯機A,乾燥機B,合計,集金担当者");
    expect(row1).toBe("2026年7月1日,本町店,1000,,0,");
    expect(row2).toBe("2026年7月2日,本町店,,2000,0,");
  });

  it("totalFunds / 担当者 が欠けていても落ちない", () => {
    const csv = recordsToCsv([
      { date: epoch(2026, 7, 27), laundryName: "本町", fundsArray: null },
    ]);
    expect(csv.split("\n")[1]).toBe("2026年7月27日,本町店,0,");
  });

  it("空配列でもヘッダーだけ返す", () => {
    const csv = recordsToCsv([]);
    expect(csv).toBe(CSV_BOM + "日付,店舗名,合計,集金担当者\n");
  });
});

describe("buildCsvFiles", () => {
  const data = [
    record({ y: 2026, m: 7, d: 27, store: "本町", total: 100 }),
    record({ y: 2026, m: 6, d: 15, store: "駅前", total: 200 }),
    record({ y: 2026, m: 7, d: 3, store: "駅前", total: 300 }),
  ];

  it("splitMethod='store' で店舗ごとに1ファイル作る", () => {
    const files = buildCsvFiles(data, { splitMethod: "store", dateSuffix: "20260727" });
    expect(files.map((f) => f.name)).toEqual([
      "collecie_本町店_20260727.csv",
      "collecie_駅前店_20260727.csv",
    ]);
    // 駅前は2件 → ヘッダー + 2行
    expect(files[1].csv.split("\n")).toHaveLength(3);
  });

  it("splitMethod='period' で年月ごとに1ファイル作り、古い順に並べる", () => {
    const files = buildCsvFiles(data, { splitMethod: "period", dateSuffix: "20260727" });
    expect(files.map((f) => f.name)).toEqual([
      "collecie_2026年6月_20260727.csv",
      "collecie_2026年7月_20260727.csv",
    ]);
  });

  it("splitMethod 未指定なら年月分割がデフォルト", () => {
    const files = buildCsvFiles(data, { dateSuffix: "20260727" });
    expect(files[0].name).toBe("collecie_2026年6月_20260727.csv");
  });

  it("空データなら空配列を返す", () => {
    expect(buildCsvFiles([], { dateSuffix: "20260727" })).toEqual([]);
  });
});
