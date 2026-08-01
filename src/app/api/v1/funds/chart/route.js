import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getStoreFundsForChart,
  getOrgCollectFunds,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

/** JST は UTC+9。date は JST 深夜 0 時の epoch なので、この分を足してから月を読む */
const JST_OFFSET = 32_400_000;

/**
 * グラフ用。明細を含まない軽量カラムのみ返す。
 *
 * from / to は epoch（ミリ秒）。**to は排他**（`lt`）なので、その月を含めたいときは
 * 翌月 1 日を渡すこと（src/functions/dateRange.js の END_EXCLUSIVE）。
 *
 * groupBy=month を付けると、生レコードではなく月ごとに畳んで返す。
 *   [{ month: "2026-07", total, count, storeCount,
 *      byStore:  { [laundryId]: total },
 *      byMethod: { cash: n, "method:PayPay": n } }]
 *
 * ⚠️ **キーは methodId ではなく「method:」+ 支払方法の名前。**
 *    支払方法は**店舗ごと**（009）なので、同じ「PayPay」でも店舗ごとに
 *    別の uuid になる。id でキーを作ると**組織全体のグラフで店舗の数だけ
 *    チップが並び、しかもどれも同じ名前**になる。名前で畳めば店舗をまたいで
 *    1 本にまとまる（機器別の内訳を名前で束ねているのと同じ理屈）。
 *
 * ⚠️ **`byMethod.cash` は「現金」の固定キー。** 支払方法テーブルに現金の行は無く、
 *    総額からキャッシュレスを引いて出している。**接頭辞を付けているのは
 *    「cash」という名前の支払方法を作られても衝突しないようにするため。**
 *    接頭辞を外すと、その 1 件が現金と合算されて静かに壊れる。
 *
 * ⚠️ **`byMethod` の値の和は `total` と一致する**（現金 = total − キャッシュレス、
 *    と定義しているため）。一致しなくなる変更を入れないこと。
 *
 * ⚠️ /funds/summary/monthly は前年同月比のため**過去 2 年に固定**されている。
 *    任意の期間で見たいときはこちらを使うこと。
 *    byStore まで一度に返すのは、積み上げ棒グラフの内訳のためにモバイルが
 *    店舗ごとへ N 本リクエストを投げるのを避けるため。
 */
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // ⚠️ Number(null) は 0 になって isFinite を通ってしまう。
  //    パラメータの有無を先に見ないと、未指定が「0 〜 0」の空区間として通る。
  if (from === null || to === null) {
    return { error: "期間の指定が不正です", status: 400 };
  }

  const startEpoch = Number(from);
  const endEpoch = Number(to);

  if (!Number.isFinite(startEpoch) || !Number.isFinite(endEpoch)) {
    return { error: "期間の指定が不正です", status: 400 };
  }
  if (endEpoch <= startEpoch) {
    return { error: "終了日は開始日より後にしてください", status: 400 };
  }

  const result = storeId
    ? await getStoreFundsForChart(storeId, startEpoch, endEpoch)
    : await getOrgCollectFunds(startEpoch, endEpoch);

  if (result.error || searchParams.get("groupBy") !== "month") return result;

  return { data: groupByMonth(result.data ?? []) };
});

function groupByMonth(rows) {
  const byMonth = new Map();

  for (const row of rows) {
    const d = new Date((row.date ?? 0) + JST_OFFSET);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    let current = byMonth.get(key);
    if (!current) {
      current = {
        month: key,
        total: 0,
        count: 0,
        stores: new Set(),
        byStore: {},
        byMethod: {},
      };
      byMonth.set(key, current);
    }

    const amount = row.totalFunds ?? 0;
    current.total += amount;
    current.count += 1;

    /*
      支払方法ごとの内訳。
      ⚠️ **現金は引き算で出す。** payment_methods に現金の行は無く、
         totalFunds は現金 + キャッシュレスの総額として保存されている。
      ⚠️ **`cash` を 0 でも必ず立てる。** キーが無いと、アプリ側で
         「現金だけで絞り込んだ月」が undefined になり NaN が出る。
    */
    const cashless = Array.isArray(row.cashless) ? row.cashless : [];
    let cashlessSum = 0;
    for (const entry of cashless) {
      const value = Number(entry?.amount) || 0;
      /*
        ⚠️ **名前で畳む（methodId ではない）。** 上のコメントの理由。
           名前が空の行は畳みようが無いので飛ばす。飛ばした分は
           cashlessSum に入らず現金として数えられるので、
           **`byMethod` の値の和が total と一致する不変条件は保たれる。**
      */
      const name = String(entry?.name ?? "").trim();
      if (!name) continue;
      const key = `method:${name}`;
      current.byMethod[key] = (current.byMethod[key] ?? 0) + value;
      cashlessSum += value;
    }
    current.byMethod.cash = (current.byMethod.cash ?? 0) + (amount - cashlessSum);

    // storeId 指定で呼ぶと laundryId を持たない場合があるので、その時は内訳を作らない
    if (row.laundryId) {
      current.stores.add(row.laundryId);
      current.byStore[row.laundryId] = (current.byStore[row.laundryId] ?? 0) + amount;
    }
  }

  // 古い順。グラフは左から右へ時系列で並べる
  return [...byMonth.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(({ stores, ...rest }) => ({ ...rest, storeCount: stores.size }));
}

export const OPTIONS = corsPreflight;
