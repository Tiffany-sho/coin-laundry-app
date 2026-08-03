// CSV 形式への出力ロジック。
// 日付変換・表データ化・グループ分けは exportData.js を参照。

import { recordsToTable, groupRecords, formatDateSuffix } from "./exportData";
import { expensesToTable, profitToTable } from "./expenseExport";

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

/** 表 1 つを CSV の断片にする（BOM は付けない） */
function tableToCsv({ header, rows }) {
  return (
    header.map(csvCell).join(",") +
    "\n" +
    rows.map((row) => row.map(csvCell).join(",")).join("\n")
  );
}

/**
 * 集金データに経費と月別利益を足した CSV。
 *
 * ⚠️ **1 つのファイルに 3 つの表を縦に並べる。** iOS の出口は共有シートしか無く
 *    複数ファイルだと数だけシートが開くため、**返すファイルは必ず 1 つ**
 *    （`funds/export` のルートのコメント参照）。
 *
 * ⚠️ **したがって「1 ファイル = 1 表」ではなくなる。** 会計ソフトへ
 *    そのまま取り込む用途では**表として読めない**ので、
 *    **経費を含めるかは利用者に選ばせる**（既定は含めない）。
 *    分けて読みたい人には Excel を勧めること（あちらはシートが分かれる）。
 *
 * ⚠️ **区切りは空行 + 見出し行。** 空行を入れないと、Excel で開いたときに
 *    前の表の続きの行として読まれて列がずれる。
 */
export function recordsToCsvWithExpenses(records, expenses) {
  const sections = [
    ["■ 集金データ", recordsToTable(records)],
    ["■ 経費", expensesToTable(expenses)],
    ["■ 月別利益", profitToTable(records, expenses)],
  ];

  return (
    CSV_BOM +
    sections
      .map(([title, table]) => `${csvCell(title)}\n${tableToCsv(table)}`)
      .join("\n\n")
  );
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
