// エクスポート（CSV / Excel）で共有する純粋ロジック。
// 日付変換・表データ化・グループ分けを担当し、出力形式には依存しない。

const EPOCH_OFFSET = 32400000; // JST +9h in ms

export function epochToDateStr(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

export function epochToYearMonth(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return { key: `${y}-${String(m).padStart(2, "0")}`, label: `${y}年${m}月` };
}

export function dateToEpoch(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").getTime();
}

export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

/**
 * 書き出しの期間プリセット。**アプリの `ExportSheet` と同じ並び。**
 *
 * ⚠️ **「1か月」は今月だけ**（直近 N か月の N=1）。ほかと数え方を変えないこと。
 * ⚠️ アプリと片方だけ増やすと、同じ組織なのに選べる期間が Web とアプリで違う。
 */
export const EXPORT_PERIODS = [
  { months: 1, label: "1か月" },
  { months: 3, label: "3か月" },
  { months: 6, label: "6か月" },
  { months: 12, label: "1年" },
  { months: 60, label: "5年" },
];

/**
 * 直近 N か月の日付範囲（`<input type="date">` に入れる文字列）。
 *
 * ⚠️ **終端は今日。** 未来まで広げても集金は増えないうえ、
 *    ファイル名の日付と食い違って見える。
 */
export function periodRange(months) {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

// ダウンロードファイル名に付ける YYYYMMDD
export function formatDateSuffix(date = new Date()) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

// グループ内の全設備名を列として横展開し、1集金履歴 = 1行の表に変換する。
// 金額は数値のまま返す（Excelで数値セルとして扱えるようにするため）。
// 該当設備の記録がない欄は null（空欄）。
//
// ⚠️ **設備の列だけでは「合計」に届かない。** collect_funds.totalFunds は
//    現金 + キャッシュレスの総額なので、キャッシュレスの列を出さないと
//    **横に足しても合計と合わない表**になる。合計入力モード（fundsArray が空）の
//    行も設備の列が全部空欄になるので、その差を「現金（内訳なし）」で埋める。
//
//    列の並び:  日付 / 店舗名 / 設備… / 現金（内訳なし） / 支払方法… / 合計 / 集金担当者
//    ⚠️ **設備の列 + 現金（内訳なし） + 支払方法の列 = 合計** が常に成り立つ。
//       ここを崩す変更を入れないこと（確定申告の材料に使われる）。
//
// ---------------------------------------------------------------------
// 機器ごとのキャッシュレス（fundsArray[].cashless）がある期間は、
// **設備の列を支払方法ごとに割る。**
//
//    日付 / 店舗名 / 洗濯機A（現金）/ 洗濯機A（PayPay）/ 乾燥機B（現金）/
//    現金（内訳なし）/ PayPay（内訳なし）/ 合計 / 集金担当者
//
// ⚠️ **集金レベルの `cashless` 列は機器ぶんを含んだ「その集金の合計」。**
//    そのまま出すと機器の列と**二重計上**になるので、支払方法の列からは
//    機器へ割り当てたぶんを引いて「内訳なし」だけを残す。
//    （BFF の getStoreMachineBreakdown の unattributed.cashless と同じ考え方）
//
// ⚠️ **機器ごとのキャッシュレスが 1 件も無い期間では列の形を変えない。**
//    現金しか扱わない組織や Web からの登録だけの期間で、
//    「（現金）」が付いただけの列が増えると過去の書き出しと見比べられなくなる。
//
// ⚠️ **支払方法の列は集金レベルと機器ごとの「和集合」で作る。**
//    片方にしか無い名前を落とすと、その金額がどの列にも乗らず
//    **横の和が合計に届かなくなる**（過去データのずれで実際に起こりうる）。
export function recordsToTable(records) {
  // グループ内に登場する全設備名を出現順で収集
  const machineNames = [];
  const seen = new Set();
  // 支払方法も同じく出現順。⚠️ 名前で寄せる（methodId は表に出しても読めない）
  const methodNames = [];
  const seenMethods = new Set();
  /** 設備名 → その設備で使われた支払方法（出現順） */
  const machineMethods = new Map();
  let hasMachineCashless = false;

  const noteMethod = (name) => {
    if (!name || seenMethods.has(name)) return;
    seenMethods.add(name);
    methodNames.push(name);
  };

  records.forEach((row) => {
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        if (!m.name) return;
        if (!seen.has(m.name)) {
          seen.add(m.name);
          machineNames.push(m.name);
          machineMethods.set(m.name, []);
        }
        if (!Array.isArray(m.cashless)) return;
        m.cashless.forEach((c) => {
          if (!c?.name) return;
          hasMachineCashless = true;
          noteMethod(c.name);
          const list = machineMethods.get(m.name);
          if (!list.includes(c.name)) list.push(c.name);
        });
      });
    }
    if (Array.isArray(row.cashless)) {
      row.cashless.forEach((c) => noteMethod(c?.name));
    }
  });

  // ⚠️ キャッシュレスが 1 件も無い期間では列ごと出さない（既存の表と同じ形に保つ）
  const hasCashless = methodNames.length > 0;
  const cashColumn = hasCashless ? ["現金（内訳なし）"] : [];

  /*
    設備の列。機器ごとのキャッシュレスがある期間だけ「（現金）」を付けて
    支払方法の列を後ろに足す。⚠️ **全通りは作らない**（使われていない
    組み合わせまで並べると、3 設備 × 3 方法で 9 列の空欄になる）。
  */
  const machineColumns = machineNames.flatMap((name) => [
    { machine: name, method: null, label: hasMachineCashless ? `${name}（現金）` : name },
    ...(machineMethods.get(name) ?? []).map((method) => ({
      machine: name,
      method,
      label: `${name}（${method}）`,
    })),
  ]);

  const methodLabels = methodNames.map((name) =>
    hasMachineCashless ? `${name}（内訳なし）` : name
  );

  const header = [
    "日付",
    "店舗名",
    ...machineColumns.map((c) => c.label),
    ...cashColumn,
    ...methodLabels,
    "合計",
    "集金担当者",
  ];

  const rows = records.map((row) => {
    // 設備ごとの売上マップ（funds * 100 = 円）
    const machineMap = {};
    /** 設備名 → 支払方法 → 円。⚠️ 集金レベルの cashless に含まれている分 */
    const perMachine = new Map();
    let machineSum = 0;
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        const amount = (m.funds ?? 0) * 100;
        if (m.name) machineMap[m.name] = amount;
        machineSum += amount;
        if (!m.name || !Array.isArray(m.cashless)) return;
        const byMethod = perMachine.get(m.name) ?? new Map();
        m.cashless.forEach((c) => {
          if (!c?.name) return;
          byMethod.set(c.name, (byMethod.get(c.name) ?? 0) + (Number(c.amount) || 0));
        });
        perMachine.set(m.name, byMethod);
      });
    }
    const machineValues = machineColumns.map(({ machine, method }) =>
      method === null
        ? machineMap[machine] ?? null
        : perMachine.get(machine)?.get(method) ?? null
    );

    // ⚠️ 単位は「円」。設備側（枚数 × 100）と違うので取り違えないこと
    const methodMap = {};
    let cashlessSum = 0;
    if (Array.isArray(row.cashless)) {
      row.cashless.forEach((c) => {
        const amount = Number(c?.amount) || 0;
        if (c?.name) methodMap[c.name] = (methodMap[c.name] ?? 0) + amount;
        cashlessSum += amount;
      });
    }

    /*
      支払方法の列は「機器へ割り当てなかったぶん」だけを出す。
      ⚠️ **引き算を省くと、機器の列と足して二重計上になる**（列は合計を持つため）。
      ⚠️ **0 は空欄。** 機種別入力では必ず 0 になるので、並べると表が 0 で埋まる。
      ⚠️ **負を 0 に丸めない。** 過去データのずれがそのまま見えなくなる。
    */
    const methodValues = methodNames.map((name) => {
      let value = methodMap[name] ?? 0;
      perMachine.forEach((byMethod) => {
        value -= byMethod.get(name) ?? 0;
      });
      return value === 0 ? null : value;
    });

    /*
      設備にも支払方法にも割り振れない残り。合計入力モードの現金がここに入る。
      ⚠️ 0 のときは空欄にする。0 を並べると「現金 0 円の集金」に読める。
    */
    const rest = (row.totalFunds ?? 0) - machineSum - cashlessSum;
    const cashValues = hasCashless ? [rest === 0 ? null : rest] : [];

    return [
      epochToDateStr(row.date),
      `${row.laundryName}店`,
      ...machineValues,
      ...cashValues,
      ...methodValues,
      row.totalFunds ?? 0,
      row.profiles?.username ?? "",
    ];
  });

  return { header, rows, machineNames, methodNames };
}

// splitMethod に応じてレコードをグループ分けする。
//   "store"  … 店舗ごと（登場順）
//   "period" … 年月ごと（年月キーの昇順）
//   "none"   … 分けない（Excel なら 1 シート）
// 戻り値: [{ key, label, records }]
export function groupRecords(records, splitMethod = "period") {
  const groups = new Map();

  /*
    分けない。
    ⚠️ **1 店舗ぶんを "store" で代用しない。** グループは laundryName で作るので、
       **店舗を改名すると 1 店舗なのに 2 グループ（＝2 シート）に割れる**
       （collect_funds.laundryName は登録時の名前を持ち、改名時に一括更新される
       仕組みに乗っているだけ）。意図が「分けない」なら "none" と書くこと。
    ⚠️ シート名だけは中身から決める。全部同じ店舗なら店舗名を出す
       （ファイル名に店舗が入らないので、ここが唯一の手掛かりになる）。
  */
  if (splitMethod === "none") {
    if (records.length === 0) return [];
    const names = new Set(records.map((row) => row.laundryName));
    const label = names.size === 1 ? `${[...names][0]}店` : "集金データ";
    return [{ key: "all", label, records }];
  }

  if (splitMethod === "store") {
    records.forEach((row) => {
      const key = row.laundryName;
      if (!groups.has(key)) groups.set(key, { key, label: `${key}店`, records: [] });
      groups.get(key).records.push(row);
    });
    return Array.from(groups.values());
  }

  records.forEach((row) => {
    const { key, label } = epochToYearMonth(row.date);
    if (!groups.has(key)) groups.set(key, { key, label, records: [] });
    groups.get(key).records.push(row);
  });
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}
