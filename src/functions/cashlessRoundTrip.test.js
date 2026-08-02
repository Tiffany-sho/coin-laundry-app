/*
  クライアント（Web の集金フォーム / 編集ドロワー）とサーバ（createData / updateData）の
  やりとりを写して、**総額が往復で変わらない**ことを確かめる。

  ⚠️ ここが崩れると型エラーも 0 行更新も起きず、金額がじわじわずれるだけになる。
*/
import { describe, it, expect } from "vitest";
import { cashPortion, sumCashless, toCashlessPayload } from "./cashlessMath";

/** サーバ: normalizeFundsArray（機器ごとの内訳を methodId で畳む） */
function normalizeFundsArray(rows) {
  const merged = new Map();
  let sum = 0;
  let hasMachineCashless = false;
  for (const raw of rows ?? []) {
    if (raw?.cashless === undefined) continue;
    hasMachineCashless = true;
    for (const item of raw.cashless) {
      merged.set(item.methodId, {
        methodId: item.methodId,
        amount: (merged.get(item.methodId)?.amount ?? 0) + item.amount,
      });
      sum += item.amount;
    }
  }
  return { entries: rows ?? [], merged: [...merged.values()], sum, hasMachineCashless };
}

/** サーバ: createData（⚠️ totalFunds は現金ぶんで受け取り、総額を組み直す） */
function createData(formData) {
  const funds = normalizeFundsArray(formData.fundsArray);
  const cashless = funds.hasMachineCashless
    ? { entries: funds.merged, sum: funds.sum }
    : { entries: formData.cashless ?? [], sum: sumCashless(formData.cashless) };
  return {
    fundsArray: funds.entries,
    totalFunds: (formData.totalFunds ?? 0) + cashless.sum,
    cashless: cashless.entries,
  };
}

/** サーバ: updateData（cashlessInput 省略＝据え置き） */
function updateData(record, fundsArray, totalFunds, cashlessInput) {
  const funds = normalizeFundsArray(fundsArray);
  if (funds.hasMachineCashless) {
    return { ...record, fundsArray: funds.entries, cashless: funds.merged, totalFunds: totalFunds + funds.sum };
  }
  if (cashlessInput === undefined) {
    return { ...record, fundsArray, totalFunds: totalFunds + sumCashless(record.cashless) };
  }
  return { ...record, fundsArray, cashless: cashlessInput, totalFunds: totalFunds + sumCashless(cashlessInput) };
}

describe("編集ドロワー（合計入力モード）", () => {
  const record = { totalFunds: 53900, cashless: [{ methodId: "cc", amount: 8900 }], fundsArray: [] };

  it("⚠️ 現金を変えずに保存しても総額が増えない（2026-08-02 まで増えていた）", () => {
    // 画面が出す編集値 = 現金ぶん
    const cash = cashPortion(record); // 45000
    const after = updateData(record, [], cash);
    expect(after.totalFunds).toBe(53900);
  });

  it("⚠️ 総額をそのまま送ると増える（旧実装の再現。回帰の目印）", () => {
    const broken = updateData(record, [], record.totalFunds);
    expect(broken.totalFunds).toBe(62800);
  });

  it("3 回保存しても増えない", () => {
    let current = record;
    for (let i = 0; i < 3; i += 1) current = updateData(current, [], cashPortion(current));
    expect(current.totalFunds).toBe(53900);
  });

  it("現金を直すとその差だけ総額が動く", () => {
    const after = updateData(record, [], 50000);
    expect(after.totalFunds).toBe(58900);
    expect(cashPortion(after)).toBe(50000);
  });

  it("キャッシュレスを直すと総額に反映される", () => {
    const after = updateData(record, [], cashPortion(record), [{ methodId: "cc", amount: 10000 }]);
    expect(after.totalFunds).toBe(55000);
  });

  it("キャッシュレスを 0 にすると内訳ごと消える", () => {
    const after = updateData(record, [], cashPortion(record), []);
    expect(after.totalFunds).toBe(45000);
    expect(after.cashless).toEqual([]);
  });
});

describe("編集ドロワー（機種別モード）", () => {
  const record = {
    totalFunds: 5400,
    cashless: [{ methodId: "pp", amount: 1200 }],
    fundsArray: [{ id: "m1", name: "洗濯機", funds: 30 }, { id: "m2", name: "乾燥機", funds: 12 }],
  };

  it("設備の枚数を直しても、キャッシュレスは据え置かれる", () => {
    const next = [{ id: "m1", name: "洗濯機", funds: 40 }, { id: "m2", name: "乾燥機", funds: 12 }];
    const cash = next.reduce((a, r) => a + r.funds, 0) * 100; // 5200
    const after = updateData(record, next, cash);
    expect(after.totalFunds).toBe(6400);
    expect(sumCashless(after.cashless)).toBe(1200);
  });

  it("画面に出す総額 = 現金ぶん + キャッシュレス", () => {
    expect(cashPortion(record) + sumCashless(record.cashless)).toBe(record.totalFunds);
  });
});

describe("集金フォーム（機種別 + 設備ごとのキャッシュレス）", () => {
  /** 画面の状態 → 送信 body（CheckDialog を写したもの） */
  const buildBody = (machines, collectionCashless) => {
    const postArray = machines.map((m) => {
      const row = { id: m.id, name: m.name, funds: m.funds || 0 };
      const entries = toCashlessPayload(m.cashless);
      if (entries.length > 0) row.cashless = entries;
      return row;
    });
    const hasMachineCashless = postArray.some((r) => r.cashless);
    return {
      fundsArray: postArray,
      totalFunds: postArray.reduce((a, r) => a + r.funds, 0) * 100,
      cashless: hasMachineCashless ? [] : toCashlessPayload(collectionCashless),
    };
  };

  it("設備ごとの内訳が総額に入り、列にも畳まれる", () => {
    const saved = createData(
      buildBody([
        { id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "900", ic: "300" } },
        { id: "m2", name: "乾燥機", funds: 12, cashless: { pp: "850" } },
      ])
    );
    expect(saved.totalFunds).toBe(4200 + 2050);
    expect(saved.cashless).toEqual([
      { methodId: "pp", amount: 1750 },
      { methodId: "ic", amount: 300 },
    ]);
  });

  it("⚠️ 不変条件: 設備の枚数 × 100 + Σcashless = totalFunds", () => {
    const saved = createData(
      buildBody([
        { id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "900" } },
        { id: "m2", name: "乾燥機", funds: 12 },
      ])
    );
    const cash = saved.fundsArray.reduce((a, r) => a + r.funds, 0) * 100;
    expect(cash + sumCashless(saved.cashless)).toBe(saved.totalFunds);
  });

  it("⚠️ 入力の無い設備には cashless キーを付けない（付けると空でもモードが切り替わる）", () => {
    const body = buildBody([
      { id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "" } },
      { id: "m2", name: "乾燥機", funds: 12 },
    ]);
    expect(body.fundsArray.every((r) => r.cashless === undefined)).toBe(true);
  });

  it("設備に 1 円も入れなければ、集金レベルの内訳がそのまま効く", () => {
    const saved = createData(
      buildBody([{ id: "m1", name: "洗濯機", funds: 30 }], { cc: "5000" })
    );
    expect(saved.totalFunds).toBe(8000);
    expect(saved.cashless).toEqual([{ methodId: "cc", amount: 5000 }]);
  });

  it("⚠️ 両方に入れても二重計上しない（設備の側が正）", () => {
    const saved = createData(
      buildBody([{ id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "900" } }], { pp: "900" })
    );
    expect(saved.totalFunds).toBe(3900);
  });

  it("合計入力モードは今までどおり", () => {
    const saved = createData({ fundsArray: [], totalFunds: 45000, cashless: toCashlessPayload({ cc: "8900" }) });
    expect(saved.totalFunds).toBe(53900);
  });
});

describe("フォームで登録 → ドロワーで編集 の通し", () => {
  it("登録した金額が、ドロワーを開いて保存し直しても変わらない", () => {
    const saved = createData({
      fundsArray: [
        { id: "m1", name: "洗濯機", funds: 30, cashless: [{ methodId: "pp", amount: 900 }] },
        { id: "m2", name: "乾燥機", funds: 12 },
      ],
      totalFunds: 4200,
      cashless: [],
    });
    expect(saved.totalFunds).toBe(5100);

    // ドロワーが出す編集値 = 現金ぶん。設備を触らず保存する
    const after = updateData(saved, saved.fundsArray, cashPortion(saved));
    expect(after.totalFunds).toBe(5100);
    expect(sumCashless(after.cashless)).toBe(900);
  });
});
