// Excel (.xlsx) 形式への出力ロジック。
// 月ごと / 店舗ごとのグループを、1ブック内の複数シートに割り当てる。
// 実際のファイル生成は write-excel-file がサーバー側で行う（api/export/collect-xlsx）。

import { recordsToTable, groupRecords } from "./exportData";
import { expensesToTable, profitToTable } from "./expenseExport";

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

/**
 * 経費と月別利益のシートを末尾に足す。
 *
 * ⚠️ **集金のシートに列として混ぜない。** あちらは
 *    「設備 + 現金（内訳なし）+ 支払方法 = 合計」が成り立つ表で、
 *    行の意味（1 行 = 1 回の集金）も違う。
 *
 * ⚠️ **経費が 0 件でもシートは出す。** 「経費も書き出す」を選んだのに
 *    シートが無いと、書き出しに失敗したのか本当に 0 件なのか区別が付かない。
 *
 * ⚠️ **文字列の列と数値の列を取り違えない。** 経費は最終列だけが金額、
 *    月別利益は 1・2・3 列目が金額で最終列（利益率）は文字列。
 *    集金シートの規則（0/1/最終列が文字列）と**違う**ので使い回さないこと。
 */
export function buildSheetsWithExpenses(records, expenses, { splitMethod = "period" } = {}) {
  const used = new Set();
  const sheets = buildSheets(records, { splitMethod });
  // ⚠️ 集金シートの名前を先に取り込む（経費シートが同名になると壊れたブックになる）
  sheets.forEach((s) => used.add(s.sheet));

  const expenseTable = expensesToTable(expenses);
  const profitTable = profitToTable(records, expenses);

  return [
    ...sheets,
    toSheet("経費", expenseTable, used, (i, len) => i === len - 1),
    // ⚠️ 利益率（最終列）は "12.3%" の文字列。数値にすると書き出しで壊れる
    toSheet("月別利益", profitTable, used, (i, len) => i >= 1 && i <= len - 2),
  ];
}

/** @param isNumber (列番号, 列数) => その列を数値として書くか */
function toSheet(label, { header, rows }, used, isNumber) {
  const headerRow = header.map((value) => ({ value, fontWeight: "bold", align: "center" }));

  const dataRows = rows.map((row) =>
    row.map((value, i) => {
      if (value === null || value === undefined || value === "") return null;
      return isNumber(i, row.length)
        ? { value: Number(value), type: Number, format: "#,##0" }
        : { value: String(value), type: String };
    })
  );

  return { sheet: sanitizeSheetName(label, used), data: [headerRow, ...dataRows] };
}
