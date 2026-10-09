import { describe, it, expect, afterEach, vi } from "vitest";
import {
  createNowData,
  getYearMonth,
  changeEpocFromNowYearMonth,
  getEpochTimeInSeconds,
  getJstDateParts,
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

describe("getJstDateParts", () => {
  it("getEpochTimeInSeconds の逆算になっている", () => {
    const cases = [
      [2024, 2, 29],
      [2025, 12, 31],
      [2026, 1, 1],
      [2026, 6, 1],
      [2026, 7, 27],
    ];
    for (const [year, month, day] of cases) {
      expect(getJstDateParts(getEpochTimeInSeconds(year, month, day))).toEqual({
        year,
        month,
        day,
      });
    }
  });

  /*
    ⚠️ **UTC で読んでいることの確認。** `new Date(epoch).getFullYear()` のように
       ローカルで読む実装だと、UTC より西の端末で 1 日前が返る。テストは TZ を
       Asia/Tokyo に固定しているので TZ を動かしては確かめられないが、
       **JST 深夜 0 時 = その日の 15:00 UTC（前日）** という性質を直接見れば
       ローカル読みでないことが分かる。
  */
  it("JST深夜0時のepochがUTCでは前日15時でも、JSTの年月日を返す", () => {
    const epoch = getEpochTimeInSeconds(2026, 10, 9);
    expect(new Date(epoch).toISOString()).toBe("2026-10-08T15:00:00.000Z");
    expect(getJstDateParts(epoch)).toEqual({ year: 2026, month: 10, day: 9 });
  });

  /*
    一括入力（BackfillRow）が「直前の行と同じ日付」を引き継ぐときの不変条件。
    年月日 → ローカル深夜 0 時 → SelectDate がローカルで読んで
    getEpochTimeInSeconds に通す、という往復で**値が動かない**こと。
    ここが崩れると「行を追加」のたびに日付が 1 日ずつ遡る。
  */
  it("SelectDate との往復で日付が動かない", () => {
    let epoch = getEpochTimeInSeconds(2026, 10, 9);
    for (let i = 0; i < 5; i++) {
      const { year, month, day } = getJstDateParts(epoch);
      const pickerEpoc = new Date(year, month - 1, day).getTime();
      const asSelectDateReports = new Date(pickerEpoc);
      epoch = getEpochTimeInSeconds(
        asSelectDateReports.getFullYear(),
        asSelectDateReports.getMonth() + 1,
        asSelectDateReports.getDate()
      );
      expect(getJstDateParts(epoch)).toEqual({ year: 2026, month: 10, day: 9 });
    }
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
