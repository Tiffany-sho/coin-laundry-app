import { describe, it, expect } from "vitest";
import {
  buildMethodRows,
  cashPortion,
  hasMachineCashless,
  sumCashless,
  sumMachineCash,
  toCashlessPayload,
} from "./cashlessMath";

describe("sumCashless / sumMachineCash", () => {
  it("空・null・未定義でも 0", () => {
    expect(sumCashless(null)).toBe(0);
    expect(sumCashless(undefined)).toBe(0);
    expect(sumCashless([])).toBe(0);
    expect(sumMachineCash(null)).toBe(0);
  });

  it("キャッシュレスは円のまま足す", () => {
    expect(sumCashless([{ amount: 1200 }, { amount: 800 }])).toBe(2000);
  });

  it("⚠️ funds は枚数なので × 100 する", () => {
    expect(sumMachineCash([{ funds: 30 }, { funds: 12 }])).toBe(4200);
  });

  it("欠損した項目を NaN にしない", () => {
    expect(sumCashless([{ amount: null }, { amount: "800" }, {}])).toBe(800);
    expect(sumMachineCash([{ funds: null }, { funds: 10 }, {}])).toBe(1000);
  });
});

describe("cashPortion", () => {
  /*
    ⚠️ **ここが 2026-08-02 まで Web で壊れていた箇所。** 編集欄に総額を出したまま
       保存すると、サーバがキャッシュレスを足し直して**毎回その分だけ増えていた。**
  */
  it("総額からキャッシュレスを引いた「現金ぶん」を返す", () => {
    const record = { totalFunds: 53900, cashless: [{ amount: 8900 }] };
    expect(cashPortion(record)).toBe(45000);
  });

  it("キャッシュレスが無ければ総額そのまま", () => {
    expect(cashPortion({ totalFunds: 12000 })).toBe(12000);
    expect(cashPortion({ totalFunds: 12000, cashless: [] })).toBe(12000);
  });

  it("⚠️ 負になっても 0 に丸めない（過去データのずれを握り潰さない）", () => {
    expect(cashPortion({ totalFunds: 1000, cashless: [{ amount: 3000 }] })).toBe(-2000);
  });

  it("レコードが無くても落ちない", () => {
    expect(cashPortion(null)).toBe(0);
    expect(cashPortion({})).toBe(0);
  });

  it("往復しても総額が変わらない（現金ぶん + キャッシュレス = 総額）", () => {
    const record = { totalFunds: 94500, cashless: [{ amount: 17500 }, { amount: 3000 }] };
    expect(cashPortion(record) + sumCashless(record.cashless)).toBe(record.totalFunds);
  });
});

describe("hasMachineCashless", () => {
  it("機器のどれかが内訳を持てば true", () => {
    expect(hasMachineCashless([{ funds: 10 }, { funds: 5, cashless: [{ amount: 100 }] }])).toBe(true);
  });

  it("空配列は「持っていない」扱い（編集させてよい）", () => {
    expect(hasMachineCashless([{ funds: 10, cashless: [] }])).toBe(false);
    expect(hasMachineCashless([])).toBe(false);
    expect(hasMachineCashless(null)).toBe(false);
  });
});

describe("toCashlessPayload", () => {
  it("画面の文字列を数値にして送れる形にする", () => {
    expect(toCashlessPayload({ pp: "1200", ic: "800" })).toEqual([
      { methodId: "pp", amount: 1200 },
      { methodId: "ic", amount: 800 },
    ]);
  });

  it("0 円・空欄・非数値は落とす", () => {
    expect(toCashlessPayload({ pp: "0", ic: "", cc: "abc", dd: undefined })).toEqual([]);
  });

  it("⚠️ name は送らない（サーバが methodId から引き直す）", () => {
    const [entry] = toCashlessPayload({ pp: "100" });
    expect(Object.keys(entry).sort()).toEqual(["amount", "methodId"]);
  });

  it("空でも落ちない", () => {
    expect(toCashlessPayload(null)).toEqual([]);
    expect(toCashlessPayload(undefined)).toEqual([]);
  });
});

describe("buildMethodRows", () => {
  const methods = [
    { id: "pp", name: "PayPay", isActive: true },
    { id: "ic", name: "交通系IC", isActive: true },
  ];

  it("記録済みを先に、未記録の有効な方法を後ろに並べる", () => {
    const rows = buildMethodRows([{ methodId: "ic", name: "交通系IC", amount: 800 }], methods);
    expect(rows.map((r) => r.id)).toEqual(["ic", "pp"]);
    expect(rows[0].amount).toBe(800);
    expect(rows[1].amount).toBe(0);
  });

  /*
    ⚠️ 並べないと**金額を 0 に戻すことすらできず、消せない内訳が残る。**
  */
  it("⚠️ 使用停止にした方法でも、記録に残っていれば必ず並べる", () => {
    const retired = [{ id: "pp", name: "PayPay", isActive: false }];
    const rows = buildMethodRows([{ methodId: "pp", name: "PayPay", amount: 1200 }], retired);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: "pp", amount: 1200, retired: true });
  });

  it("使用停止で記録にも無いものは並べない", () => {
    const rows = buildMethodRows([], [{ id: "pp", name: "PayPay", isActive: false }]);
    expect(rows).toEqual([]);
  });

  it("店舗から消えた方法は記録の名前に落とす", () => {
    const rows = buildMethodRows([{ methodId: "gone", name: "旧QR", amount: 500 }], methods);
    expect(rows[0]).toMatchObject({ id: "gone", name: "旧QR", retired: true });
  });

  it("名前すら残っていなければ、それと分かる表示にする", () => {
    const rows = buildMethodRows([{ methodId: "gone", amount: 500 }], []);
    expect(rows[0].name).toBe("（削除された支払方法）");
  });

  it("現在の登録名を優先する（記録は登録時の名前を焼き込んでいる）", () => {
    const rows = buildMethodRows([{ methodId: "pp", name: "ペイペイ", amount: 100 }], methods);
    expect(rows[0].name).toBe("PayPay");
  });

  it("同じ methodId が 2 回記録されていても 1 行にする", () => {
    const rows = buildMethodRows(
      [
        { methodId: "pp", name: "PayPay", amount: 100 },
        { methodId: "pp", name: "PayPay", amount: 200 },
      ],
      methods
    );
    expect(rows.filter((r) => r.id === "pp")).toHaveLength(1);
  });

  it("どちらも空なら空配列", () => {
    expect(buildMethodRows(null, null)).toEqual([]);
    expect(buildMethodRows([], [])).toEqual([]);
  });
});
