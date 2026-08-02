/**
 * 支払方法ごとの集金の畳み込み。
 *
 * BFF（`/api/v1/funds/chart?groupBy=month`）と Web の収益ページで同じ数字を出すため、
 * 集計はここ 1 か所に置く。
 *
 * ⚠️ **キーは methodId ではなく「method:」+ 支払方法の名前。**
 *    支払方法は**店舗ごと**（009）なので、同じ「PayPay」でも店舗ごとに別の uuid になる。
 *    id でキーを作ると**組織全体のグラフで店舗の数だけ項目が並び、しかもどれも同じ名前**
 *    になる。名前で畳めば店舗をまたいで 1 本にまとまる（機器別の内訳と同じ理屈）。
 *
 * ⚠️ **`cash` は「現金」の固定キー。** payment_methods に現金の行は無く、
 *    総額からキャッシュレスを引いて出している。接頭辞を付けているのは
 *    「cash」という名前の支払方法を作られても衝突しないようにするため。
 *    接頭辞を外すと、その 1 件が現金と合算されて静かに壊れる。
 *
 * ⚠️ **値の和は必ず `total` と一致する**（現金 = total − キャッシュレス、と定義しているため）。
 *    一致しなくなる変更を入れないこと。
 */

/** 現金の固定キー。⚠️ 支払方法の名前と衝突させないため接頭辞と分けてある */
export const CASH_KEY = "cash";

/** 支払方法のキーを作る。⚠️ 名前で畳む（id ではない） */
export function methodKey(name) {
  return `method:${name}`;
}

/** キーを画面に出す名前へ戻す */
export function methodLabel(key) {
  return key === CASH_KEY ? "現金" : String(key).replace(/^method:/, "");
}

/**
 * 1 レコードを支払方法ごとに割る。
 *
 * @returns `{ [key]: 金額 }`。⚠️ 現金は 0 でも必ず立てる
 *          （キーが無いと「現金だけの月」が undefined になり NaN が出る）
 */
export function splitRowByMethod(row) {
  const amount = row?.totalFunds ?? 0;
  const out = {};

  const cashless = Array.isArray(row?.cashless) ? row.cashless : [];
  let cashlessSum = 0;

  for (const entry of cashless) {
    const value = Number(entry?.amount) || 0;
    /*
      ⚠️ 名前が空の行は畳みようが無いので飛ばす。飛ばした分は cashlessSum に
         入らず現金として数えられるので、**値の和が total と一致する不変条件は保たれる。**
    */
    const name = String(entry?.name ?? "").trim();
    if (!name) continue;
    const key = methodKey(name);
    out[key] = (out[key] ?? 0) + value;
    cashlessSum += value;
  }

  out[CASH_KEY] = (out[CASH_KEY] ?? 0) + (amount - cashlessSum);
  return out;
}

/**
 * 期間ぶんをまとめて支払方法ごとに畳む。収益ページの「支払方法別」が使う。
 *
 * @returns `[{ key, name, total }]` 金額の多い順。⚠️ 0 円の方法は落とす
 *          （使っていない方法が並ぶと読みにくいため）
 */
export function methodTotals(rows) {
  const byKey = new Map();
  let grandTotal = 0;

  for (const row of rows ?? []) {
    grandTotal += row?.totalFunds ?? 0;
    for (const [key, value] of Object.entries(splitRowByMethod(row))) {
      byKey.set(key, (byKey.get(key) ?? 0) + value);
    }
  }

  const items = [...byKey.entries()]
    .map(([key, total]) => ({ key, name: methodLabel(key), total }))
    .filter((item) => item.total !== 0)
    .sort((a, b) => b.total - a.total);

  return { items, total: grandTotal };
}

/**
 * 月ごとに畳む。BFF の `groupBy=month` の応答をそのまま作る。
 *
 * ⚠️ 形を変えるとアプリのグラフが壊れる（`byStore` / `byMethod` / `storeCount` を
 *    そのまま読んでいる）。
 */
export function groupFundsByMonth(rows, jstOffset = 32_400_000) {
  const byMonth = new Map();

  for (const row of rows ?? []) {
    const d = new Date((row?.date ?? 0) + jstOffset);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    let current = byMonth.get(key);
    if (!current) {
      current = { month: key, total: 0, count: 0, stores: new Set(), byStore: {}, byMethod: {} };
      byMonth.set(key, current);
    }

    const amount = row?.totalFunds ?? 0;
    current.total += amount;
    current.count += 1;

    for (const [methodKeyName, value] of Object.entries(splitRowByMethod(row))) {
      current.byMethod[methodKeyName] = (current.byMethod[methodKeyName] ?? 0) + value;
    }

    // storeId 指定で呼ぶと laundryId を持たない場合があるので、その時は内訳を作らない
    if (row?.laundryId) {
      current.stores.add(row.laundryId);
      current.byStore[row.laundryId] = (current.byStore[row.laundryId] ?? 0) + amount;
    }
  }

  // 古い順。グラフは左から右へ時系列で並べる
  return [...byMonth.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(({ stores, ...rest }) => ({ ...rest, storeCount: stores.size }));
}
