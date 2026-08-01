import { describe, it, expect, afterEach, vi } from "vitest";
import {
  epochToDateStr,
  epochToYearMonth,
  dateToEpoch,
  toDateInputValue,
  defaultDateRange,
  formatDateSuffix,
  recordsToTable,
  groupRecords,
} from "./exportData";
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

describe("recordsToTable", () => {
  it("設備が無ければ基本列だけのヘッダーを返す", () => {
    const { header } = recordsToTable([
      record({ y: 2026, m: 7, d: 27, store: "本町", total: 12000, user: "田中" }),
    ]);
    expect(header).toEqual(["日付", "店舗名", "合計", "集金担当者"]);
  });

  it("店舗名に「店」を付け、金額は数値のまま返す", () => {
    const { rows } = recordsToTable([
      record({ y: 2026, m: 7, d: 27, store: "本町", total: 12000, user: "田中" }),
    ]);
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 12000, "田中"]);
  });

  it("設備名を列に横展開し、funds を100倍して円に直す", () => {
    const { header, rows } = recordsToTable([
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
    expect(header).toEqual(["日付", "店舗名", "洗濯機A", "乾燥機B", "合計", "集金担当者"]);
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 3000, 1200, 4200, "田中"]);
  });

  it("設備の集合が行ごとに違っても列を揃え、欠けた設備は null にする", () => {
    const { header, rows } = recordsToTable([
      record({ y: 2026, m: 7, d: 1, store: "本町", machines: [{ name: "洗濯機A", funds: 10 }] }),
      record({ y: 2026, m: 7, d: 2, store: "本町", machines: [{ name: "乾燥機B", funds: 20 }] }),
    ]);
    expect(header).toEqual(["日付", "店舗名", "洗濯機A", "乾燥機B", "合計", "集金担当者"]);
    expect(rows[0]).toEqual(["2026年7月1日", "本町店", 1000, null, 0, ""]);
    expect(rows[1]).toEqual(["2026年7月2日", "本町店", null, 2000, 0, ""]);
  });

  it("fundsArray / totalFunds / 担当者 が欠けていても落ちない", () => {
    const { rows } = recordsToTable([
      { date: epoch(2026, 7, 27), laundryName: "本町", fundsArray: null },
    ]);
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 0, ""]);
  });

  it("空配列ならヘッダーのみで行は空", () => {
    const { header, rows } = recordsToTable([]);
    expect(header).toEqual(["日付", "店舗名", "合計", "集金担当者"]);
    expect(rows).toEqual([]);
  });

  // ---- 支払方法（キャッシュレス）----
  //
  // ⚠️ totalFunds は「現金 + キャッシュレス」の総額。支払方法の列を出さないと
  //    横に足しても合計に届かない表になる。**横の和 = 合計**を必ず保つこと。

  it("キャッシュレスが無ければ列は増えない（既存の表と同じ形）", () => {
    const { header } = recordsToTable([
      record({ y: 2026, m: 7, d: 27, store: "本町", machines: [{ name: "洗濯機A", funds: 30 }], total: 3000 }),
    ]);
    expect(header).toEqual(["日付", "店舗名", "洗濯機A", "合計", "集金担当者"]);
  });

  it("支払方法を列に出し、設備 + 現金 + 支払方法 の横の和が合計に一致する", () => {
    const { header, rows } = recordsToTable([
      {
        date: epoch(2026, 7, 27),
        laundryName: "本町",
        // 現金 3000（枚数 30）+ PayPay 1200 = 4200
        fundsArray: [{ name: "洗濯機A", funds: 30 }],
        cashless: [{ methodId: "pp", name: "PayPay", amount: 1200 }],
        totalFunds: 4200,
        profiles: { username: "田中" },
      },
    ]);
    expect(header).toEqual([
      "日付", "店舗名", "洗濯機A", "現金（内訳なし）", "PayPay", "合計", "集金担当者",
    ]);
    // 現金（内訳なし）は 0 なので空欄
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 3000, null, 1200, 4200, "田中"]);

    const [, , ...rest] = rows[0];
    const parts = rest.slice(0, 3).map((v) => v ?? 0);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(4200);
  });

  it("合計入力モード（fundsArray が空）の現金は「現金（内訳なし）」に入る", () => {
    const { rows } = recordsToTable([
      {
        date: epoch(2026, 7, 27),
        laundryName: "本町",
        fundsArray: [],
        cashless: [{ methodId: "cc", name: "クレカ", amount: 8900 }],
        totalFunds: 53900, // 現金 45000 + クレカ 8900
        profiles: null,
      },
    ]);
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 45000, 8900, 53900, ""]);
  });

  it("cashless が null / 未定義でも落ちない（007 適用前に入った行）", () => {
    const { rows } = recordsToTable([
      { date: epoch(2026, 7, 27), laundryName: "本町", fundsArray: null, cashless: null, totalFunds: 1000 },
    ]);
    expect(rows[0]).toEqual(["2026年7月27日", "本町店", 1000, ""]);
  });
});

describe("groupRecords", () => {
  const data = [
    record({ y: 2026, m: 7, d: 27, store: "本町", total: 100 }),
    record({ y: 2026, m: 6, d: 15, store: "駅前", total: 200 }),
    record({ y: 2026, m: 7, d: 3, store: "駅前", total: 300 }),
  ];

  it("'store' は店舗ごとに登場順でまとめ、ラベルに「店」を付ける", () => {
    const groups = groupRecords(data, "store");
    expect(groups.map((g) => g.label)).toEqual(["本町店", "駅前店"]);
    expect(groups[1].records).toHaveLength(2);
  });

  it("'period' は年月ごとにまとめ、古い順に並べる", () => {
    const groups = groupRecords(data, "period");
    expect(groups.map((g) => g.label)).toEqual(["2026年6月", "2026年7月"]);
    expect(groups[1].records).toHaveLength(2);
  });

  it("splitMethod 未指定なら年月分割がデフォルト", () => {
    expect(groupRecords(data)[0].label).toBe("2026年6月");
  });

  it("空データなら空配列", () => {
    expect(groupRecords([], "store")).toEqual([]);
    expect(groupRecords([], "period")).toEqual([]);
  });
});
