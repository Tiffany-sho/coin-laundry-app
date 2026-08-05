import { redirect } from "next/navigation";

/**
 * 旧「経費」ページ。**2026-08-05 に `/expenses` へ昇格した。**
 *
 * ⚠️ **消さずにリダイレクトで残す。** 収益ページ（`CoinDataList`）と
 *    月別利益カード（`MonthlyProfitCard`）からのリンク、それに
 *    ブックマークがこの URL を指している。**消すと 404 になる。**
 */
export default function LegacyExpensesPage() {
  redirect("/expenses");
}
