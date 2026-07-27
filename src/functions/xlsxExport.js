// Excel (.xlsx) 形式への出力ロジック。
// 月ごと / 店舗ごとのグループを、1ブック内の複数シートに割り当てる。
// 実際のファイル生成は write-excel-file がサーバー側で行う（api/export/collect-xlsx）。

import { recordsToTable, groupRecords } from "./exportData";

export const SHEET_NAME_MAX = 31;

// Excel のシート名で使えない文字（write-excel-file も例外を投げる）
const ILLEGAL_SHEET_CHARS = /[[\]/\\:*?]/g;

// Excel のシート名制約に合わせて正規化する。
//   - 使用禁止文字 [ ] / \ : * ? を全角相当の安全な文字へ置換
//   - 31文字以内に切り詰め
//   - 空文字にならないようフォールバック
//   - used に既出の名前があれば連番を付けて一意化（重複すると壊れたブックになる）
export function sanitizeSheetName(name, used) {
  let s = String(name ?? "")
    .replace(ILLEGAL_SHEET_CHARS, "-")
    .trim();
  if (s === "") s = "Sheet";
  if (s.length > SHEET_NAME_MAX) s = s.slice(0, SHEET_NAME_MAX);

  if (!used) return s;

  if (!used.has(s)) {
    used.add(s);
    return s;
  }
  // 重複時は " (2)", " (3)" … を付ける。上限を超えないよう本体側を削る。
  for (let i = 2; ; i++) {
    const suffix = ` (${i})`;
    const base = s.slice(0, SHEET_NAME_MAX - suffix.length);
    const candidate = base + suffix;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
}

// write-excel-file に渡すシート定義の配列を組み立てる。
// 戻り値: [{ sheet: "2026年7月", data: [[cell, ...], ...] }]
export function buildSheets(records, { splitMethod = "period" } = {}) {
  const used = new Set();

  return groupRecords(records, splitMethod).map((group) => {
    const { header, rows } = recordsToTable(group.records);

    const headerRow = header.map((label) => ({
      value: label,
      fontWeight: "bold",
      align: "center",
    }));

    const dataRows = rows.map((row) =>
      row.map((value, i) => {
        if (value === null || value === undefined || value === "") return null;
        // 0列目=日付, 1列目=店舗名, 最終列=担当者 は文字列。それ以外の金額列は数値。
        const isTextColumn = i === 0 || i === 1 || i === row.length - 1;
        return isTextColumn
          ? { value: String(value), type: String }
          : { value: Number(value), type: Number, format: "#,##0" };
      })
    );

    return {
      sheet: sanitizeSheetName(group.label, used),
      data: [headerRow, ...dataRows],
    };
  });
}
