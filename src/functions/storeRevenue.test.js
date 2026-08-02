import { describe, expect, it } from "vitest";
import {
  aggregateStoreRevenue,
  averagePerCollect,
  pickStoreRevenue,
  revenueTotals,
} from "./storeRevenue";
import { getEpochTimeInSeconds } from "./makeDate/date";

const d = (y, m, day) => getEpochTimeInSeconds(y, m, day);

const row = (laundryId, laundryName, totalFunds, date) => ({
  laundryId,
  laundryName,
  totalFunds,
  date,
});

describe("aggregateStoreRevenue", () => {
  const rows = [
    row("a", "北店", 1000, d(2026, 1, 10)),
    row("b", "南店", 5000, d(2026, 3, 1)),
    row("a", "北店", 2000, d(2025, 12, 1)),
    row("a", "北店", 3000, d(2026, 2, 20)),
  ];

  it("店舗ごとに合計・件数を畳む", () => {
    const result = aggregateStoreRevenue(rows);
    expect(result).toHaveLength(2);
    const north = result.find((s) => s.laundryId === "a");
    expect(north.total).toBe(6000);
    expect(north.count).toBe(3);
  });

  it("売上の多い順に並べる", () => {
    const result = aggregateStoreRevenue(rows);
    expect(result.map((s) => s.laundryId)).toEqual(["a", "b"]);
  });

  it("最初と最後の集金日を出す（並び順に依存しない）", () => {
    const north = aggregateStoreRevenue(rows).find((s) => s.laundryId === "a");
    expect(north.firstDate).toBe(d(2025, 12, 1));
    expect(north.lastDate).toBe(d(2026, 1, 10) > d(2026, 2, 20) ? d(2026, 1, 10) : d(2026, 2, 20));
    expect(north.lastDate).toBe(d(2026, 2, 20));
  });

  // date が欠けた行を期間の計算に混ぜると firstDate が null に落ちる
  it("date が無い行も合計と件数には数える", () => {
    const result = aggregateStoreRevenue([
      row("a", "北店", 1000, d(2026, 1, 10)),
      { laundryId: "a", laundryName: "北店", totalFunds: 500 },
    ]);
    expect(result[0].total).toBe(1500);
    expect(result[0].count).toBe(2);
    expect(result[0].firstDate).toBe(d(2026, 1, 10));
    expect(result[0].lastDate).toBe(d(2026, 1, 10));
  });

  it("空・未定義でも落ちない", () => {
    expect(aggregateStoreRevenue([])).toEqual([]);
    expect(aggregateStoreRevenue(undefined)).toEqual([]);
  });

  it("totalFunds が null の行を NaN にしない", () => {
    const result = aggregateStoreRevenue([
      { laundryId: "a", laundryName: "北店", totalFunds: null, date: d(2026, 1, 1) },
    ]);
    expect(result[0].total).toBe(0);
  });
});

describe("revenueTotals", () => {
  it("全店舗の合計・件数・期間をまとめる", () => {
    const stores = aggregateStoreRevenue([
      row("a", "北店", 1000, d(2026, 1, 10)),
      row("b", "南店", 5000, d(2026, 3, 1)),
      row("a", "北店", 2000, d(2025, 12, 1)),
    ]);
    const totals = revenueTotals(stores);
    expect(totals.total).toBe(8000);
    expect(totals.count).toBe(3);
    expect(totals.storeCount).toBe(2);
    expect(totals.firstDate).toBe(d(2025, 12, 1));
    expect(totals.lastDate).toBe(d(2026, 3, 1));
  });

  it("集金が 1 件も無ければ期間は null", () => {
    const totals = revenueTotals([]);
    expect(totals.total).toBe(0);
    expect(totals.count).toBe(0);
    expect(totals.firstDate).toBeNull();
    expect(totals.lastDate).toBeNull();
  });
});

describe("averagePerCollect", () => {
  it("四捨五入した平均を返す", () => {
    expect(averagePerCollect(10000, 3)).toBe(3333);
    expect(averagePerCollect(10000, 4)).toBe(2500);
  });

  // 0 で割ると Infinity になり、画面に NaN が出る
  it("0 件なら null（NaN を画面に出さない）", () => {
    expect(averagePerCollect(0, 0)).toBeNull();
    expect(averagePerCollect(1000, 0)).toBeNull();
    expect(averagePerCollect(1000, undefined)).toBeNull();
  });
});

describe("pickStoreRevenue", () => {
  const stores = aggregateStoreRevenue([row("a", "北店", 1000, d(2026, 1, 10))]);

  it("該当店舗を取り出す", () => {
    expect(pickStoreRevenue(stores, "a").total).toBe(1000);
  });

  // 集金がまだ無い店舗はこの集計に現れないので、必ず起こる
  it("集金がまだ無い店舗でも 0 件の形を返す", () => {
    const empty = pickStoreRevenue(stores, "zzz");
    expect(empty.total).toBe(0);
    expect(empty.count).toBe(0);
    expect(empty.firstDate).toBeNull();
  });
});
