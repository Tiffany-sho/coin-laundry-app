import { getEpochTimeInSeconds } from "./makeDate/date";

/**
 * 経費の集計と、月の行き来。
 *
 * ⚠️ **金額の単位は「円」。** `collect_funds.fundsArray[].funds` は硬貨の枚数で
 *    金額にするには × 100。同じ収益ページに並ぶので取り違えないこと。
 *
 * ⚠️ **`date` は JST 深夜 0 時の epoch**（`collect_funds.date` と同じ規約）。
 *    月の境界も `getEpochTimeInSeconds` で作る。`new Date()` から作ると時刻が残り、
 *    月初の 1 件が範囲から落ちる。
 */

const JST_OFFSET = 32_400_000;

/** epoch（JST 深夜 0 時）→ "YYYY-MM"。⚠️ JST で読む（UTC で読むと月初が前月になる） */
export function monthKeyFromEpoch(epoch) {
  const d = new Date(epoch + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM" → { year, month }（month は 1 始まり） */
export function parseMonthKey(key) {
  const [y, m] = String(key).split("-");
  return { year: Number(y), month: Number(m) };
}

/** "YYYY-MM" を offset か月ずらす。負の値で過去へ */
export function shiftMonthKey(key, offset) {
  const { year, month } = parseMonthKey(key);
  const total = year * 12 + (month - 1) + offset;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** 今月の "YYYY-MM"。⚠️ JST 基準 */
export function currentMonthKey(now = Date.now()) {
  const d = new Date(now + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * "YYYY-MM" → `getExpenses` に渡す期間。
 *
 * ⚠️ **終了は「その月の末日」で、翌月 1 日ではない。** `getExpenses` の endEpoch は
 *    **含む**（`.lte`）ため。`/funds/chart` の to は排他なので規約が逆になっている。
 */
export function monthRange(key) {
  const { year, month } = parseMonthKey(key);
  const start = getEpochTimeInSeconds(year, month, 1);
  // 翌月 1 日の 1 日前 = その月の末日
  const nextFirst =
    month === 12
      ? getEpochTimeInSeconds(year + 1, 1, 1)
      : getEpochTimeInSeconds(year, month + 1, 1);
  return { start, end: nextFirst - 24 * 60 * 60 * 1000 };
}

/** "YYYY-MM" → 「2026年7月」 */
export function formatMonthKey(key) {
  const { year, month } = parseMonthKey(key);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return "";
  return `${year}年${month}月`;
}

/** 合計金額 */
export function totalAmount(items) {
  let total = 0;
  for (const item of items ?? []) total += item?.amount ?? 0;
  return total;
}

/**
 * カテゴリごとに畳む。金額の多い順。
 *
 * ⚠️ 展開した固定費（`recurring: true`）も混ぜて数える。除くと、家賃を含まない
 *    「経費合計」が出て収支が合わなくなる。
 */
export function byCategory(items) {
  const map = new Map();
  for (const item of items ?? []) {
    const key = item?.category ?? "その他";
    if (!map.has(key)) map.set(key, { category: key, total: 0, count: 0 });
    const current = map.get(key);
    current.total += item?.amount ?? 0;
    current.count += 1;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** 店舗ごとに畳む。`laundryId` が null のものは「組織全体」 */
export function byStore(items, storeNameById = {}) {
  const map = new Map();
  for (const item of items ?? []) {
    const key = item?.laundryId ?? null;
    if (!map.has(key)) {
      map.set(key, {
        laundryId: key,
        name: key === null ? "組織全体" : (storeNameById[key] ?? "（削除された店舗）"),
        total: 0,
        count: 0,
      });
    }
    const current = map.get(key);
    current.total += item?.amount ?? 0;
    current.count += 1;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/**
 * 収益と経費から利益を出す。
 *
 * ⚠️ **利益率は収益が 0 のとき null。** 0 で割ると Infinity になり、画面に
 *    「Infinity%」が出る。経費だけ登録して収益がまだ無い月は普通に起こる。
 */
export function profitOf(revenue, expense) {
  const profit = (revenue ?? 0) - (expense ?? 0);
  const margin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : null;
  return { profit, margin };
}

/* ------------------------------------------------------------------ */
/* 月別利益（売上 − 経費）                                             */
/* ------------------------------------------------------------------ */

/**
 * 月ごとの経費合計。
 *
 * ⚠️ **展開された固定費（`recurring: true`）も足す。** 除くと家賃を含まない
 *    「経費」になり、利益が実際より大きく出る。
 * ⚠️ **`date` は JST 深夜 0 時の epoch。** `monthKeyFromEpoch` を通すこと
 *    （UTC で読むと月初の 1 件が前月に落ちる）。
 */
export function expenseTotalsByMonth(expenses) {
  const map = new Map();
  for (const item of expenses ?? []) {
    const amount = item?.amount;
    const date = item?.date;
    if (!Number.isFinite(amount) || !Number.isFinite(date)) continue;
    const key = monthKeyFromEpoch(date);
    map.set(key, (map.get(key) ?? 0) + amount);
  }
  return map;
}

/**
 * 直近 `count` か月のキーを古い順で返す。
 * ⚠️ **データのある月だけ並べない。** 歯抜けだと棒の間隔が月と対応しなくなる。
 */
export function recentMonthKeys(count, endKey = currentMonthKey()) {
  const out = [];
  for (let i = count - 1; i >= 0; i -= 1) out.push(shiftMonthKey(endKey, -i));
  return out;
}

/**
 * 月別利益の棒を組み立てる。
 *
 * ⚠️ **同じ計算がアプリにもある**（`src/components/revenue/profitSeries.ts`）。
 *    **片方だけ直すと同じ月の利益が Web とアプリで食い違う。** 型エラーは出ない。
 *
 * @param revenueMonths `groupByMonth()` の結果（`[{ key, total }]`）
 * @param expenses      `getExpenses()` の結果（固定費の展開ぶんを含む）
 * @param monthKeys     並べる月（`recentMonthKeys()`）
 * @returns `[{ key, label, revenue, expense, profit }]`
 *          ⚠️ **`profit` は負になり得る。** 0 に丸めないこと
 */
export function buildProfitPoints(revenueMonths, expenses, monthKeys) {
  const revenueByMonth = new Map(
    (revenueMonths ?? []).map((month) => [month.key, month.total ?? 0])
  );
  const expenseByMonth = expenseTotalsByMonth(expenses);

  return (monthKeys ?? []).map((key) => {
    const revenue = revenueByMonth.get(key) ?? 0;
    const expense = expenseByMonth.get(key) ?? 0;
    return { key, label: formatMonthKey(key), revenue, expense, profit: revenue - expense };
  });
}

/** 期間の合計。⚠️ `profit` は `revenue - expense` と必ず一致する */
export function sumProfitPoints(points) {
  let revenue = 0;
  let expense = 0;
  for (const point of points ?? []) {
    revenue += point?.revenue ?? 0;
    expense += point?.expense ?? 0;
  }
  return { revenue, expense, profit: revenue - expense };
}
