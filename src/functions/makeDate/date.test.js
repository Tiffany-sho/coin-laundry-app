import { describe, it, expect, afterEach, vi } from "vitest";
import {
  createNowData,
  getYearMonth,
  changeEpocFromNowYearMonth,
  getEpochTimeInSeconds,
} from "./date";

// アプリは epoch を「JST 深夜0時」として保存する前提（getEpochTimeInSeconds 参照）。
// テストは vitest.config.mjs で TZ=Asia/Tokyo に固定されている。
const jst = (iso) => new Date(`${iso}+09:00`).getTime();

describe("getEpochTimeInSeconds", () => {
  it("JSTの深夜0時に対応するepochミリ秒を返す", () => {
    expect(getEpochTimeInSeconds(2026, 7, 27)).toBe(jst("2026-07-27T00:00:00"));
  });

  it("月をまたぐ日付を正しく扱う", () => {
    expect(getEpochTimeInSeconds(2026, 1, 1)).toBe(jst("2026-01-01T00:00:00"));
    expect(getEpochTimeInSeconds(2025, 12, 31)).toBe(jst("2025-12-31T00:00:00"));
  });

  it("うるう年の2月29日を扱える", () => {
    expect(getEpochTimeInSeconds(2024, 2, 29)).toBe(jst("2024-02-29T00:00:00"));
  });
});

describe("createNowData", () => {
  it("epochを YYYY/M/D 形式に変換する（ゼロ埋めなし）", () => {
    expect(createNowData(getEpochTimeInSeconds(2026, 7, 27))).toBe("2026/7/27");
    expect(createNowData(getEpochTimeInSeconds(2026, 1, 5))).toBe("2026/1/5");
  });

  it("getEpochTimeInSeconds と往復できる", () => {
    const cases = [
      [2024, 2, 29],
      [2025, 12, 31],
      [2026, 6, 1],
    ];
    for (const [y, m, d] of cases) {
      expect(createNowData(getEpochTimeInSeconds(y, m, d))).toBe(`${y}/${m}/${d}`);
    }
  });
});

describe("getYearMonth", () => {
  it("YYYY-MM 形式（月はゼロ埋め）を返す", () => {
    expect(getYearMonth(getEpochTimeInSeconds(2026, 7, 27))).toBe("2026-07");
    expect(getYearMonth(getEpochTimeInSeconds(2026, 12, 1))).toBe("2026-12");
  });

  it("月初・月末どちらも同じ年月キーになる", () => {
    expect(getYearMonth(getEpochTimeInSeconds(2026, 3, 1))).toBe("2026-03");
    expect(getYearMonth(getEpochTimeInSeconds(2026, 3, 31))).toBe("2026-03");
  });
});

describe("changeEpocFromNowYearMonth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const freeze = (iso) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${iso}+09:00`));
  };

  it("ago=0 で今月1日のepochを返す", () => {
    freeze("2026-07-27T12:00:00");
    expect(changeEpocFromNowYearMonth(0)).toBe(jst("2026-07-01T00:00:00"));
  });

  it("負の値で過去の月初、正の値で未来の月初を返す", () => {
    freeze("2026-07-27T12:00:00");
    expect(changeEpocFromNowYearMonth(-1)).toBe(jst("2026-06-01T00:00:00"));
    expect(changeEpocFromNowYearMonth(-2)).toBe(jst("2026-05-01T00:00:00"));
    expect(changeEpocFromNowYearMonth(1)).toBe(jst("2026-08-01T00:00:00"));
  });

  it("年をまたいで遡れる", () => {
    freeze("2026-02-10T09:00:00");
    expect(changeEpocFromNowYearMonth(-3)).toBe(jst("2025-11-01T00:00:00"));
  });
});
