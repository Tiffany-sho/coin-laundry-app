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

/*
  確認画面（CheckDialog）とフッターの見込み額が、実際に登録される金額と
  1 円まで一致すること。

  ⚠️ **集金方法（機種別 / 合計）でキャッシュレスの出どころが変わる。**
     3 か所（フッター・確認画面・送信）が同じ足し方を持っているので、
     1 つでもずれると「確認した金額と違うものが登録される」。
*/
describe("確認画面の総合計 = 登録される totalFunds", () => {
  const sumValues = (values) =>
    Object.values(values ?? {}).reduce((acc, v) => acc + (Number(v) || 0), 0);

  /** 送信 body（postHander） */
  const buildBody = (checked, machines, moneyTotal, collectionCashless) => {
    const postArray = checked
      ? machines.map((m) => {
          const row = { id: m.id, name: m.name, funds: m.funds || 0 };
          const entries = toCashlessPayload(m.cashless);
          if (entries.length > 0) row.cashless = entries;
          return row;
        })
      : [];
    const hasMachineCashless = postArray.some((r) => r.cashless);
    return {
      fundsArray: postArray,
      totalFunds: checked
        ? postArray.reduce((a, r) => a + r.funds, 0) * 100
        : Number(moneyTotal) || 0,
      cashless: hasMachineCashless ? [] : toCashlessPayload(collectionCashless),
    };
  };

  /** 確認画面の総合計 */
  const dialogTotal = (checked, machines, moneyTotal, collectionCashless) => {
    const machineCashless = checked
      ? machines.flatMap((m) => toCashlessPayload(m.cashless))
      : [];
    const machineSum = machineCashless.reduce((a, e) => a + e.amount, 0);
    const collection = machineSum > 0 ? [] : toCashlessPayload(collectionCashless);
    const cash = checked
      ? machines.reduce((a, m) => a + (m.funds || 0), 0) * 100
      : Number(moneyTotal) || 0;
    return cash + machineSum + collection.reduce((a, e) => a + e.amount, 0);
  };

  /** フッターの見込み額 */
  const footerTotal = (checked, machines, moneyTotal, collectionCashless) => {
    const machineSum = machines.reduce((a, m) => a + sumValues(m.cashless), 0);
    const cashless =
      checked && machineSum > 0 ? machineSum : sumValues(collectionCashless);
    const cash = checked
      ? machines.reduce((a, m) => a + (m.funds || 0), 0) * 100
      : Number(moneyTotal) || 0;
    return cash + cashless;
  };

  const cases = [
    {
      name: "合計入力 + 集金レベルのキャッシュレス（⚠️ 確認画面に 1 円も出ていなかった）",
      checked: false,
      machines: [],
      moneyTotal: "45000",
      collection: { cc: "8900" },
      expected: 53900,
    },
    {
      name: "合計入力 + 現金のみ",
      checked: false,
      machines: [],
      moneyTotal: "45000",
      collection: {},
      expected: 45000,
    },
    {
      name: "機種別 + 設備ごとのキャッシュレス",
      checked: true,
      machines: [
        { id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "900" } },
        { id: "m2", name: "乾燥機", funds: 12 },
      ],
      moneyTotal: "",
      collection: {},
      expected: 5100,
    },
    {
      name: "⚠️ 機種別 + 合計入力で入れてから切り替えた分（欄は消えるが登録される）",
      checked: true,
      machines: [{ id: "m1", name: "洗濯機", funds: 30 }],
      moneyTotal: "45000",
      collection: { cc: "8900" },
      expected: 11900,
    },
    {
      name: "⚠️ 両方に入っていたら機器の側だけ（集金レベルは捨てられる）",
      checked: true,
      machines: [{ id: "m1", name: "洗濯機", funds: 30, cashless: { pp: "900" } }],
      moneyTotal: "",
      collection: { cc: "8900" },
      expected: 3900,
    },
    {
      name: "機種別 + 現金のみ",
      checked: true,
      machines: [{ id: "m1", name: "洗濯機", funds: 30 }],
      moneyTotal: "",
      collection: {},
      expected: 3000,
    },
  ];

  it.each(cases)("$name", ({ checked, machines, moneyTotal, collection, expected }) => {
    const saved = createData(buildBody(checked, machines, moneyTotal, collection));
    expect(saved.totalFunds).toBe(expected);
    expect(dialogTotal(checked, machines, moneyTotal, collection)).toBe(expected);
    expect(footerTotal(checked, machines, moneyTotal, collection)).toBe(expected);
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

/*
  ⚠️ **文字列を足すと連結になる。** Web の合計入力（Chakra の NumberInput）は
     `e.value` が文字列なので、サーバが `totalFunds + cashless.sum` を計算した瞬間
     `"45000" + 8900` → `"450008900"` になる。例外は出ず、Postgres の integer 列も
     450,008,900 として受け取るので、**2 つの金額が横に連結された数字が保存される。**
     キャッシュレスが 0 件のうちは Postgres 側で型変換されて表に出なかった。
*/
describe("金額は必ず数値にしてから足す", () => {
  const toAmount = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  };

  it("⚠️ 素朴に足すと連結になる（これが実際に起きていた）", () => {
    expect(("45000" ?? 0) + 8900).toBe("450008900");
  });

  it("toAmount を通せば和になる", () => {
    expect(toAmount("45000") + 8900).toBe(53900);
  });

  it("キャッシュレスが 0 件だと連結が起きず、気づけない", () => {
    // ⚠️ 文字列のまま Postgres へ渡り、integer 列で 45000 に変換されていた
    expect(("45000" ?? 0) + 0).toBe("450000");
    expect(toAmount("45000") + 0).toBe(45000);
  });

  it("空欄・null・非数値は 0 にする", () => {
    for (const value of ["", null, undefined, "abc", NaN, {}]) {
      expect(toAmount(value)).toBe(0);
    }
  });

  it("小数を混ぜない（円未満は切り捨て）", () => {
    expect(toAmount("45000.7")).toBe(45000);
    expect(toAmount(-12.9)).toBe(-12);
  });

  it("数値はそのまま通る（アプリ・Outbox の再送）", () => {
    expect(toAmount(45000)).toBe(45000);
    expect(toAmount(0)).toBe(0);
  });

  it("設備の枚数も数値にする（jsonb に文字列を入れない）", () => {
    const entries = [{ funds: "30" }, { funds: 12 }].map((r) => ({ funds: toAmount(r.funds) }));
    expect(entries.reduce((a, r) => a + r.funds, 0) * 100).toBe(4200);
  });
});
