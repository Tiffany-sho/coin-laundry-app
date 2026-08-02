import { describe, expect, it } from "vitest";
import {
  CASH_KEY,
  groupFundsByMonth,
  methodKey,
  methodLabel,
  methodTotals,
  splitRowByMethod,
} from "./fundsByMethod";
import { getEpochTimeInSeconds } from "./makeDate/date";

const d = (y, m, day) => getEpochTimeInSeconds(y, m, day);

/** totalFunds は現金 + キャッシュレスの総額として保存されている */
const row = (totalFunds, cashless, date = d(2026, 7, 10), laundryId = "s1") => ({
  totalFunds,
  cashless,
  date,
  laundryId,
});

describe("methodKey / methodLabel", () => {
  it("往復して元の名前に戻る", () => {
    expect(methodLabel(methodKey("PayPay"))).toBe("PayPay");
  });

  it("現金は固定キー", () => {
    expect(methodLabel(CASH_KEY)).toBe("現金");
  });

  // 接頭辞を外すと「cash」という名前の支払方法が現金と合算されて静かに壊れる
  it("「cash」という名前の支払方法が現金と衝突しない", () => {
    expect(methodKey("cash")).not.toBe(CASH_KEY);
    expect(methodLabel(methodKey("cash"))).toBe("cash");
  });
});

describe("splitRowByMethod", () => {
  it("キャッシュレスを引いた残りを現金にする", () => {
    const result = splitRowByMethod(row(10000, [{ name: "PayPay", amount: 3000 }]));
    expect(result[CASH_KEY]).toBe(7000);
    expect(result[methodKey("PayPay")]).toBe(3000);
  });

  // キーが無いと「現金だけの月」が undefined になり NaN が出る
  it("キャッシュレスが無くても現金キーを必ず立てる", () => {
    expect(splitRowByMethod(row(5000, []))[CASH_KEY]).toBe(5000);
    expect(splitRowByMethod(row(5000, null))[CASH_KEY]).toBe(5000);
    expect(splitRowByMethod({ totalFunds: 5000 })[CASH_KEY]).toBe(5000);
  });

  it("全額キャッシュレスなら現金は 0", () => {
    const result = splitRowByMethod(row(3000, [{ name: "PayPay", amount: 3000 }]));
    expect(result[CASH_KEY]).toBe(0);
  });

  it("同じ名前が 2 行あっても足し合わせる", () => {
    const result = splitRowByMethod(
      row(10000, [
        { name: "PayPay", amount: 1000 },
        { name: "PayPay", amount: 2000 },
      ])
    );
    expect(result[methodKey("PayPay")]).toBe(3000);
    expect(result[CASH_KEY]).toBe(7000);
  });

  // 名前が空の行を飛ばした分は現金として数える。和の不変条件を壊さないため
  it("名前が空の内訳は現金に寄せる（和は total と一致する）", () => {
    const result = splitRowByMethod(row(10000, [{ name: "  ", amount: 2000 }]));
    expect(result[CASH_KEY]).toBe(10000);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBe(10000);
  });

  it("値の和は必ず totalFunds と一致する", () => {
    const rows = [
      row(10000, [{ name: "PayPay", amount: 3000 }]),
      row(8000, [
        { name: "PayPay", amount: 1000 },
        { name: "交通系IC", amount: 500 },
      ]),
      row(4200, []),
    ];
    for (const r of rows) {
      const sum = Object.values(splitRowByMethod(r)).reduce((a, b) => a + b, 0);
      expect(sum).toBe(r.totalFunds);
    }
  });
});

describe("methodTotals", () => {
  const rows = [
    row(10000, [{ name: "PayPay", amount: 3000 }]),
    row(5000, [{ name: "交通系IC", amount: 5000 }]),
    row(2000, []),
  ];

  it("金額の多い順に並べる", () => {
    const { items } = methodTotals(rows);
    expect(items.map((i) => i.name)).toEqual(["現金", "交通系IC", "PayPay"]);
    expect(items.find((i) => i.name === "現金").total).toBe(9000);
    expect(items.find((i) => i.name === "PayPay").total).toBe(3000);
  });

  it("内訳の和が総額と一致する", () => {
    const { items, total } = methodTotals(rows);
    expect(total).toBe(17000);
    expect(items.reduce((sum, i) => sum + i.total, 0)).toBe(17000);
  });

  // 使っていない方法が並ぶと読みにくい
  it("0 円の方法は落とす", () => {
    const { items } = methodTotals([row(3000, [{ name: "PayPay", amount: 3000 }])]);
    expect(items.map((i) => i.name)).toEqual(["PayPay"]);
  });

  it("空でも落ちない", () => {
    expect(methodTotals([])).toEqual({ items: [], total: 0 });
    expect(methodTotals(undefined)).toEqual({ items: [], total: 0 });
  });
});

describe("groupFundsByMonth", () => {
  const rows = [
    row(10000, [{ name: "PayPay", amount: 3000 }], d(2026, 7, 10), "s1"),
    row(5000, [], d(2026, 7, 20), "s2"),
    row(8000, [{ name: "PayPay", amount: 1000 }], d(2026, 8, 1), "s1"),
  ];

  it("月ごとに畳み、古い順に並べる", () => {
    const result = groupFundsByMonth(rows);
    expect(result.map((p) => p.month)).toEqual(["2026-07", "2026-08"]);
  });

  it("月の合計・件数・店舗数を出す", () => {
    const [july] = groupFundsByMonth(rows);
    expect(july.total).toBe(15000);
    expect(july.count).toBe(2);
    expect(july.storeCount).toBe(2);
  });

  it("店舗別と支払方法別の両方を持つ", () => {
    const [july] = groupFundsByMonth(rows);
    expect(july.byStore).toEqual({ s1: 10000, s2: 5000 });
    expect(july.byMethod[methodKey("PayPay")]).toBe(3000);
    expect(july.byMethod[CASH_KEY]).toBe(12000);
  });

  // 月ごとでも和の不変条件は保たれていなければならない
  it("byMethod の和が月の total と一致する", () => {
    for (const point of groupFundsByMonth(rows)) {
      const sum = Object.values(point.byMethod).reduce((a, b) => a + b, 0);
      expect(sum).toBe(point.total);
    }
  });

  // JST 深夜 0 時の epoch を UTC で読むと月初が前月に落ちる
  it("月初の集金が前月に落ちない", () => {
    const result = groupFundsByMonth([row(1000, [], d(2026, 8, 1), "s1")]);
    expect(result[0].month).toBe("2026-08");
  });

  it("laundryId が無い行では店舗別を作らない（店舗指定で取ったとき）", () => {
    const result = groupFundsByMonth([
      { totalFunds: 1000, cashless: [], date: d(2026, 7, 1) },
    ]);
    expect(result[0].byStore).toEqual({});
    expect(result[0].storeCount).toBe(0);
  });
});
