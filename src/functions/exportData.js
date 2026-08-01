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
export function recordsToTable(records) {
  // グループ内に登場する全設備名を出現順で収集
  const machineNames = [];
  const seen = new Set();
  // 支払方法も同じく出現順。⚠️ 名前で寄せる（methodId は表に出しても読めない）
  const methodNames = [];
  const seenMethods = new Set();

  records.forEach((row) => {
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        if (m.name && !seen.has(m.name)) {
          seen.add(m.name);
          machineNames.push(m.name);
        }
      });
    }
    if (Array.isArray(row.cashless)) {
      row.cashless.forEach((c) => {
        if (c?.name && !seenMethods.has(c.name)) {
          seenMethods.add(c.name);
          methodNames.push(c.name);
        }
      });
    }
  });

  // ⚠️ キャッシュレスが 1 件も無い期間では列ごと出さない（既存の表と同じ形に保つ）
  const hasCashless = methodNames.length > 0;
  const cashColumn = hasCashless ? ["現金（内訳なし）"] : [];

  const header = [
    "日付",
    "店舗名",
    ...machineNames,
    ...cashColumn,
    ...methodNames,
    "合計",
    "集金担当者",
  ];

  const rows = records.map((row) => {
    // 設備ごとの売上マップ（funds * 100 = 円）
    const machineMap = {};
    let machineSum = 0;
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        const amount = (m.funds ?? 0) * 100;
        if (m.name) machineMap[m.name] = amount;
        machineSum += amount;
      });
    }
    const machineValues = machineNames.map((name) => machineMap[name] ?? null);

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
    const methodValues = methodNames.map((name) => methodMap[name] ?? null);

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
// 戻り値: [{ key, label, records }]
export function groupRecords(records, splitMethod = "period") {
  const groups = new Map();

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
