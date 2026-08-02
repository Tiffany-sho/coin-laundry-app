/**
 * 店舗別の累計売上の畳み込み。
 *
 * `getStoreRevenueSummary()` は集計せず生レコード（totalFunds / laundryName /
 * laundryId / date）を返す。畳むのはここ 1 か所だけにして、
 * BFF（`/api/v1/funds/summary/stores`）と Web の収益ページで同じ数字を出す。
 *
 * ⚠️ **これは全期間を見ている唯一の集計。** 月次サマリー
 *    （`getCollectMonthlySummary`）は前年同月比のため過去 2 年に固定されていて、
 *    しかも月単位に畳んだあとなので日にちが分からない。「集計期間」を出せるのはこちら。
 */

/**
 * 生レコードを店舗ごとに畳む。売上の多い順。
 *
 * @param rows `{ laundryId, laundryName, totalFunds, date }` の配列
 * @returns `{ laundryId, laundryName, total, count, firstDate, lastDate }` の配列
 */
export function aggregateStoreRevenue(rows) {
  const byStore = new Map();

  for (const row of rows ?? []) {
    const amount = row?.totalFunds ?? 0;
    // ⚠️ date が欠けた行でも件数と合計には数える。期間の計算からだけ外す
    const date = typeof row?.date === "number" ? row.date : null;
    const current = byStore.get(row?.laundryId);

    if (!current) {
      byStore.set(row?.laundryId, {
        laundryId: row?.laundryId,
        laundryName: row?.laundryName,
        total: amount,
        count: 1,
        firstDate: date,
        lastDate: date,
      });
      continue;
    }

    current.total += amount;
    current.count += 1;
    if (date !== null) {
      if (current.firstDate === null || date < current.firstDate) current.firstDate = date;
      if (current.lastDate === null || date > current.lastDate) current.lastDate = date;
    }
  }

  return [...byStore.values()].sort((a, b) => b.total - a.total);
}

/**
 * 畳んだ店舗別の売上をさらに 1 行にまとめる。総額収益カードが使う。
 *
 * ⚠️ `storeCount` は**集金が 1 件でもある店舗の数**であって、組織の店舗数ではない。
 *    集金がまだ無い店舗はこの集計に現れない。
 */
export function revenueTotals(stores) {
  let total = 0;
  let count = 0;
  let firstDate = null;
  let lastDate = null;

  for (const store of stores ?? []) {
    total += store?.total ?? 0;
    count += store?.count ?? 0;
    if (typeof store?.firstDate === "number") {
      if (firstDate === null || store.firstDate < firstDate) firstDate = store.firstDate;
    }
    if (typeof store?.lastDate === "number") {
      if (lastDate === null || store.lastDate > lastDate) lastDate = store.lastDate;
    }
  }

  return { total, count, firstDate, lastDate, storeCount: (stores ?? []).length };
}

/**
 * 1 回あたりの平均集金額。
 *
 * ⚠️ **0 件のときは null を返す。** 0 で割ると Infinity / NaN になり、
 *    そのまま `toLocaleString()` すると画面に「NaN」が出る。
 */
export function averagePerCollect(total, count) {
  if (!count || count <= 0) return null;
  return Math.round(total / count);
}

/** 特定店舗ぶんだけ取り出す。無ければ 0 件の形を返す */
export function pickStoreRevenue(stores, laundryId) {
  const found = (stores ?? []).find((s) => s?.laundryId === laundryId);
  return (
    found ?? {
      laundryId,
      laundryName: null,
      total: 0,
      count: 0,
      firstDate: null,
      lastDate: null,
    }
  );
}
