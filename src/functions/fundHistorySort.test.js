import { describe, it, expect } from "vitest";
import { SORT_AXES, nextSort } from "./fundHistory";

/*
  ⚠️ **アプリの `SortControls` と同じ規則であること。** 片方だけ変えると、
     同じ操作なのに Web とアプリで並び順が変わる。
*/
describe("nextSort", () => {
  const initial = { orderAmount: "date", upOrder: false }; // 集金日・新しい順

  it("効いている軸をもう一度押すと反転する", () => {
    expect(nextSort(initial, "date")).toEqual({ orderAmount: "date", upOrder: true });
  });

  it("反転をもう一度押すと戻る", () => {
    const flipped = nextSort(initial, "date");
    expect(nextSort(flipped, "date")).toEqual(initial);
  });

  it("別の軸を押すとその軸の既定の向きになる", () => {
    expect(nextSort(initial, "totalFunds")).toEqual({
      orderAmount: "totalFunds",
      upOrder: false, // 売上は高い順から
    });
  });

  /*
    ⚠️ 「別の軸に移ったら既定」であって「今の向きを引き継ぐ」ではない。
       引き継ぐと、日付の古い順から売上へ移ったときに「売上が低い順」が出て驚く。
  */
  it("古い順で見ていても、売上に移ったら高い順から始まる", () => {
    const oldestFirst = { orderAmount: "date", upOrder: true };
    expect(nextSort(oldestFirst, "totalFunds").upOrder).toBe(false);
  });

  it("軸を往復しても向きが勝手に変わらない", () => {
    let state = { orderAmount: "date", upOrder: true }; // 古い順
    state = nextSort(state, "totalFunds"); // 売上・高い順
    state = nextSort(state, "date"); // 集金日へ戻る
    // ⚠️ 戻ったときは既定（新しい順）。前の「古い順」を覚えていない
    expect(state).toEqual({ orderAmount: "date", upOrder: false });
  });

  it("知らない軸を渡しても落ちない", () => {
    expect(nextSort(initial, "unknown")).toEqual({ orderAmount: "unknown", upOrder: false });
  });

  it("軸はアプリと同じ 2 つ（集金日 / 売上）", () => {
    expect(SORT_AXES.map((a) => a.value)).toEqual(["date", "totalFunds"]);
    expect(SORT_AXES.map((a) => a.label)).toEqual(["集金日", "売上"]);
  });

  it("向きの説明が両方の軸にある（矢印だけにしない）", () => {
    for (const axis of SORT_AXES) {
      expect(axis.hint.asc).toBeTruthy();
      expect(axis.hint.desc).toBeTruthy();
      expect(axis.hint.asc).not.toBe(axis.hint.desc);
    }
  });
});
