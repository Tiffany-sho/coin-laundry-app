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
export function recordsToTable(records) {
  // グループ内に登場する全設備名を出現順で収集
  const machineNames = [];
  const seen = new Set();
  records.forEach((row) => {
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        if (m.name && !seen.has(m.name)) {
          seen.add(m.name);
          machineNames.push(m.name);
        }
      });
    }
  });

  const header = ["日付", "店舗名", ...machineNames, "合計", "集金担当者"];

  const rows = records.map((row) => {
    // 設備ごとの売上マップ（funds * 100 = 円）
    const machineMap = {};
    if (Array.isArray(row.fundsArray)) {
      row.fundsArray.forEach((m) => {
        if (m.name) machineMap[m.name] = (m.funds ?? 0) * 100;
      });
    }
    const machineValues = machineNames.map((name) => machineMap[name] ?? null);

    return [
      epochToDateStr(row.date),
      `${row.laundryName}店`,
      ...machineValues,
      row.totalFunds ?? 0,
      row.profiles?.username ?? "",
    ];
  });

  return { header, rows, machineNames };
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
