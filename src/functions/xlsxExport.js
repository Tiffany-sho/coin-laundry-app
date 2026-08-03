// Excel (.xlsx) 形式への出力ロジック。
// 月ごと / 店舗ごとのグループを、1ブック内の複数シートに割り当てる。
// 実際のファイル生成は write-excel-file がサーバー側で行う（api/export/collect-xlsx）。

import { recordsToTable, groupRecords } from "./exportData";
import { expensesToTable, groupExpenses, profitToTable } from "./expenseExport";

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
    return {
      sheet: sanitizeSheetName(group.label, used),
      // 0列目=日付, 1列目=店舗名, 最終列=担当者 は文字列。それ以外の金額列は数値
      data: [headerRowOf(header), ...numberRows(rows, (i, len) => i !== 0 && i !== 1 && i !== len - 1)],
    };
  });
}

/**
 * 集金データと経費を**同じシート**に書く（2026-08-03）。
 *
 * 経費は**集金データと同じ区別**で分ける。`splitMethod` が
 *   "period" … その月の集金の下に、その月の経費
 *   "store"  … その店舗の集金の下に、その店舗の経費
 *   "none"   … 1 枚のシートに全部
 *
 * ⚠️ **列として混ぜない。空行 + 「■ 経費」の見出しで区切った別ブロックにする。**
 *    集金の表は「設備 + 現金（内訳なし）+ 支払方法 = 合計」という
 *    **横の和の不変条件**を持ち、確定申告の材料に使われる。
 *    行の意味（1 行 = 1 回の集金）も違う。
 *
 * ⚠️ **それでも同じ列に金額が縦に並ぶ。** 列をまるごと選択して合計すると
 *    **集金と経費が混ざる。** ブロックを分けても消せない性質。
 *
 * ⚠️ **どのシートにも入らない経費を黙って落とさない。**
 *    `"store"` で分けたときの組織全体（`laundry_id` が NULL）と、
 *    集金の無い月・店舗の経費がそれ。別シートに逃がす。
 *
 * ⚠️ **月別利益だけは 1 枚独立**（期間をまたぐ表なので、月ごとのシートに
 *    入れると 1 行しか出ず比べられない）。
 *
 * ⚠️ **文字列の列と数値の列を取り違えない。** 集金は 0/1/最終列が文字列、
 *    経費は最終列だけが金額、月別利益は最終列（利益率）だけが文字列。**全部違う。**
 */
export function buildSheetsWithExpenses(records, expenses, { splitMethod = "period" } = {}) {
  const used = new Set();
  const byGroup = groupExpenses(expenses, splitMethod);
  /** どのグループにも入らなかったぶんを拾うため、使ったキーを覚えておく */
  const consumed = new Set();

  const groups = groupRecords(records, splitMethod);

  const sheets = groups.map((group) => {
    const { header, rows } = recordsToTable(group.records);
    const mine = byGroup.get(group.key === "all" ? "all" : groupKeyOf(group, splitMethod)) ?? [];
    consumed.add(group.key === "all" ? "all" : groupKeyOf(group, splitMethod));

    const data = [
      headerRowOf(header),
      ...numberRows(rows, (i, len) => i !== 0 && i !== 1 && i !== len - 1),
    ];

    /*
      ⚠️ **経費は集金の表の「下」に別のブロックとして置く。** 列として混ぜると
         「設備 + 現金（内訳なし）+ 支払方法 = 合計」という**横の和の不変条件**が崩れる
         （行の意味も 1 行 = 1 回の集金ではなくなる）。
      ⚠️ **空行 + 見出し行で必ず区切る。** 空行が無いと、Excel が前の表の続きの行として
         読んで列がずれる（オートフィルタや並べ替えが集金と経費をまたぐ）。
      ⚠️ **同じ列に集金と経費の金額が縦に並ぶ。** 列をまるごと選択して合計すると
         **両方が混ざる。** 区切りを入れても消せない性質なので、ここを承知で使うこと。
    */
    if (mine.length > 0) {
      const table = expensesToTable(mine);
      data.push([], [{ value: "■ 経費", fontWeight: "bold" }]);
      data.push(headerRowOf(table.header));
      data.push(...numberRows(table.rows, (i, len) => i === len - 1));
    }

    return { sheet: sanitizeSheetName(group.label, used), data };
  });

  /*
    どのシートにも入らなかった経費。
    ⚠️ **`"store"` で分けたときの「組織全体」（`laundry_id` が NULL）がこれ。**
       店舗に紐づかないのでどの店舗のシートにも入れられない。
       ⚠️ **黙って落とさない。** 落とすと書き出しから経費が消えたことに気づけない。
    ⚠️ 集金の無い月・店舗にだけ経費がある場合もここに来る（`groupRecords` は
       集金からしかグループを作らないため）。
  */
  const orphans = [...byGroup.entries()]
    .filter(([key]) => !consumed.has(key))
    .flatMap(([, list]) => list);

  if (orphans.length > 0) {
    const table = expensesToTable(orphans);
    sheets.push({
      sheet: sanitizeSheetName(splitMethod === "store" ? "組織全体の経費" : "その他の経費", used),
      data: [headerRowOf(table.header), ...numberRows(table.rows, (i, len) => i === len - 1)],
    });
  }

  /*
    月別利益は**期間をまたぐ表**なので、月ごと・店舗ごとのシートには入れられない
    （1 シート = 1 か月だと 1 行しか出ず、比べるためのものにならない）。
    ⚠️ **1 枚だけ独立して置く。**
  */
  const profitTable = profitToTable(records, expenses);
  if (profitTable.rows.length > 0) {
    sheets.push(
      // ⚠️ 利益率（最終列）は "12.3%" の文字列。数値にすると書き出しで壊れる
      toSheet("月別利益", profitTable, used, (i, len) => i >= 1 && i <= len - 2)
    );
  }

  return sheets;
}

/** グループのキー。⚠️ `groupExpenses` の作り方と必ず揃えること */
function groupKeyOf(group, splitMethod) {
  if (splitMethod === "none") return "all";
  // "store" は laundryName、"period" は "YYYY-MM"。どちらも groupRecords の key と同じ
  return group.key;
}

function headerRowOf(header) {
  return header.map((value) => ({ value, fontWeight: "bold", align: "center" }));
}

/** @param isNumber (列番号, 列数) => その列を数値として書くか */
function numberRows(rows, isNumber) {
  return rows.map((row) =>
    row.map((value, i) => {
      if (value === null || value === undefined || value === "") return null;
      return isNumber(i, row.length)
        ? { value: Number(value), type: Number, format: "#,##0" }
        : { value: String(value), type: String };
    })
  );
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
