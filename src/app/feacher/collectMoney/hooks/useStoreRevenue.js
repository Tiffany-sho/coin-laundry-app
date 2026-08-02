"use client";

import { useEffect, useState } from "react";
import { getStoreRevenueSummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { aggregateStoreRevenue } from "@/functions/storeRevenue";

/**
 * 店舗別の累計売上（全期間）。
 *
 * ⚠️ **収益ページで 1 回だけ呼ぶこと。** 総額収益カードと店舗別グラフの両方が
 *    同じ数字を必要とするが、`getStoreRevenueSummary()` は全期間の生レコードを
 *    引くので二重に呼ぶと重い（1000 行ずつのページングが 2 周する）。
 *    呼び出しは CoinDataList に置き、結果を props で配る。
 *
 * ⚠️ 畳み込みは `src/functions/storeRevenue.js`。BFF（`/api/v1/funds/summary/stores`）も
 *    同じ関数を通しているので、アプリと Web で数字がずれない。
 */
export default function useStoreRevenue() {
  const [stores, setStores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    getStoreRevenueSummary()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) {
          setError(typeof error === "string" ? error : "集金データの取得に失敗しました");
        } else {
          setStores(aggregateStoreRevenue(data));
        }
      })
      .catch(() => {
        if (alive) setError("集金データの取得に失敗しました");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    // 画面を離れたあとに setState しない
    return () => {
      alive = false;
    };
  }, []);

  return { stores, loading, error };
}
