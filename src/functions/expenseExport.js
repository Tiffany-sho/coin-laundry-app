// 経費と月別利益の書き出し。集金データの整形（exportData.js）とは**別の表**にする。
//
// ⚠️ **集金の表に経費の列を足さないこと。** あちらは
//    「設備 + 現金（内訳なし）+ 支払方法 = 合計」が常に成り立つ表で、
//    確定申告の材料に使われる。経費は行の意味（1 行 = 1 回の集金）が違ううえ、
//    足すと横の和が合計に一致しなくなる。
//
// ⚠️ **`"use server"` のモジュールに置かない。** async 関数しか export できず、
//    ビルドが「ページデータを収集できない」としか言わずに落ちる。

const JST_OFFSET = 32_400_000;

/** epoch（JST 深夜 0 時）→ "YYYY-MM"。⚠️ UTC で読むと月初が前月になる */
function monthKey(epoch) {
  const d = new Date(Number(epoch) + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM" → "2026年8月" */
export function formatMonth(key) {
  const [y, m] = String(key).split("-");
  return `${Number(y)}年${Number(m)}月`;
}

/** epoch → "YYYY/MM/DD"（JST）。⚠️ exportData.js の epochToDateStr と同じ形にする */
function dateStr(epoch) {
  const d = new Date(Number(epoch) + JST_OFFSET);
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

/**
 * 経費の一覧を表にする。
 *
 *   日付 / 対象 / カテゴリ / 内容 / 金額
 *
 * ⚠️ **「対象」を必ず出す。** 同じ金額・同じカテゴリの行が店舗の数だけ並ぶので、
 *    無いとどれがどの店舗か区別が付かない（画面の一覧と同じ理由）。
 *    店名は応答が焼き込んだ `laundryName` を使う（⚠️ 店舗一覧から引かない。
 *    担当店舗で絞られるので担当外が「（削除された店舗）」になる）。
 *
 * ⚠️ **毎月の固定費は展開された結果が混ざる**（`recurring: true`）。
 *    定義ではなく各月に計上された 1 行として出るので、そのまま並べてよい。
 *    「毎月」の列を足してあるのは、実体の行と見分けが付くようにするため。
 */
export function expensesToTable(expenses) {
  const header = ["日付", "対象", "カテゴリ", "内容", "毎月", "金額"];

  const rows = (expenses ?? []).map((e) => [
    dateStr(e.date),
    scopeLabel(e),
    e.category ?? "",
    // ⚠️ 固定費の note には名前が入るが、無ければカテゴリと同じ。二重に並べない
    e.note && e.note !== e.category ? e.note : "",
    e.recurring ? "○" : "",
    toAmount(e.amount),
  ]);

  return { header, rows };
}

/** 経費 1 件の「対象」。⚠️ `laundryId` が無い = 組織全体（店舗に紐づかない支出） */
function scopeLabel(expense) {
  if (!expense?.laundryId) return "組織全体";
  if (expense.laundryName) return `${expense.laundryName}店`;
  /* ⚠️ サーバが探して見つからなかったときだけここに来る（本当に消えている） */
  return "（削除された店舗）";
}

/** ⚠️ 数値であることまで確かめる（欠けた項目が NaN のまま表に出るのを防ぐ） */
function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * 月別の売上・経費・利益。
 *
 *   月 / 売上 / 経費 / 利益 / 利益率
 *
 * ⚠️ **利益は負になり得る。** `Math.max(値, 0)` で潰さないこと
 *    （**赤字の月が黒字に見える**）。画面の月別利益と同じ規約。
 *
 * ⚠️ **利益率は売上が 0 のとき空にする。** 0 で割ると `Infinity%` が表に出る。
 *    経費だけ入れて集金がまだ無い月は普通に起こる。
 *
 * ⚠️ **売上は `totalFunds`（総額）。** 現金だけの額ではない。
 *    キャッシュレスを落とすと利益が実際より小さく出る。
 *
 * ⚠️ **集金が 0 件の月でも経費があれば行を出す。** 出さないと、
 *    その月の赤字が表から消える。
 */
export function profitToTable(records, expenses) {
  const header = ["月", "売上", "経費", "利益", "利益率"];

  const revenue = new Map();
  const cost = new Map();

  (records ?? []).forEach((r) => {
    const key = monthKey(r.date);
    revenue.set(key, (revenue.get(key) ?? 0) + toAmount(r.totalFunds));
  });
  (expenses ?? []).forEach((e) => {
    const key = monthKey(e.date);
    cost.set(key, (cost.get(key) ?? 0) + toAmount(e.amount));
  });

  // ⚠️ 売上と経費の**和集合**。片方しか無い月を落とさない
  const months = [...new Set([...revenue.keys(), ...cost.keys()])].sort();

  const rows = months.map((key) => {
    const sales = revenue.get(key) ?? 0;
    const spent = cost.get(key) ?? 0;
    const profit = sales - spent;
    return [
      formatMonth(key),
      sales,
      spent,
      profit,
      // ⚠️ 売上 0 の月は空欄（Infinity% を出さない）
      sales > 0 ? `${Math.round((profit / sales) * 1000) / 10}%` : "",
    ];
  });

  /*
    合計行。⚠️ **利益率は「利益の合計 ÷ 売上の合計」で出し直す。**
    月ごとの利益率を平均すると、売上の小さい月が同じ重みで効いて実態とずれる。
  */
  const sales = rows.reduce((n, r) => n + r[1], 0);
  const spent = rows.reduce((n, r) => n + r[2], 0);
  const profit = sales - spent;
  if (rows.length > 0) {
    rows.push([
      "合計",
      sales,
      spent,
      profit,
      sales > 0 ? `${Math.round((profit / sales) * 1000) / 10}%` : "",
    ]);
  }

  return { header, rows };
}
