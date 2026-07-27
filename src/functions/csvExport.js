// CSVエクスポートの純粋ロジック。
// UI (ExportPanel.jsx) から分離してテスト可能にしている。

export const CSV_BOM = "﻿"; // Excelで文字化けさせないためのBOM
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

// グループ内の全設備名を列として横展開し、1集金履歴 = 1行に変換する
export function recordsToCsv(records) {
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

  const header = ["日付", "店舗名", ...machineNames, "合計", "集金担当者"].join(",") + "\n";

  const rows = records
    .map((row) => {
      const date = epochToDateStr(row.date);
      const store = `${row.laundryName}店`;
      const total = row.totalFunds ?? 0;
      const collector = row.profiles?.username ?? "";

      // 設備ごとの売上マップ（funds * 100 = 円）
      const machineMap = {};
      if (Array.isArray(row.fundsArray)) {
        row.fundsArray.forEach((m) => {
          if (m.name) machineMap[m.name] = (m.funds ?? 0) * 100;
        });
      }

      const machineValues = machineNames.map((name) => machineMap[name] ?? "");
      return [date, store, ...machineValues, total, collector].join(",");
    })
    .join("\n");

  return CSV_BOM + header + rows;
}

// splitMethod に応じて {name, csv} の配列を組み立てる
//   "store"  … 店舗ごとに1ファイル
//   "period" … 年月ごとに1ファイル（年月キーの昇順）
export function buildCsvFiles(records, { splitMethod = "period", dateSuffix } = {}) {
  const suffix = dateSuffix ?? formatDateSuffix();

  if (splitMethod === "store") {
    const groups = new Map();
    records.forEach((row) => {
      if (!groups.has(row.laundryName)) groups.set(row.laundryName, []);
      groups.get(row.laundryName).push(row);
    });
    return Array.from(groups, ([name, rows]) => ({
      name: `collecie_${name}店_${suffix}.csv`,
      csv: recordsToCsv(rows),
    }));
  }

  const groups = new Map();
  records.forEach((row) => {
    const { key, label } = epochToYearMonth(row.date);
    if (!groups.has(key)) groups.set(key, { label, rows: [] });
    groups.get(key).rows.push(row);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { label, rows }]) => ({
      name: `collecie_${label}_${suffix}.csv`,
      csv: recordsToCsv(rows),
    }));
}
