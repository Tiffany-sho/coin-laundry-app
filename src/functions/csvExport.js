// CSV 形式への出力ロジック。
// 日付変換・表データ化・グループ分けは exportData.js を参照。

import { recordsToTable, groupRecords, formatDateSuffix } from "./exportData";

export const CSV_BOM = "﻿"; // Excelで文字化けさせないためのBOM

// CSVの1セルをエスケープする（RFC 4180）。
// 店舗名・設備名・担当者名はユーザー入力なので、カンマや引用符・改行が含まれうる。
// 該当文字を含む場合はダブルクォートで囲み、内部の " は "" に二重化する。
export function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// 1グループ分のレコードを CSV 文字列にする
export function recordsToCsv(records) {
  const { header, rows } = recordsToTable(records);
  const headerLine = header.map(csvCell).join(",") + "\n";
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  return CSV_BOM + headerLine + body;
}

// splitMethod に応じて {name, csv} の配列を組み立てる
//   "store"  … 店舗ごとに1ファイル
//   "period" … 年月ごとに1ファイル（年月キーの昇順）
export function buildCsvFiles(records, { splitMethod = "period", dateSuffix } = {}) {
  const suffix = dateSuffix ?? formatDateSuffix();
  return groupRecords(records, splitMethod).map((group) => ({
    name: `collecie_${group.label}_${suffix}.csv`,
    csv: recordsToCsv(group.records),
  }));
}
