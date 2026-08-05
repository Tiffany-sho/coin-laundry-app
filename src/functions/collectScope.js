/**
 * 集金で「何を記録するか」。
 *
 * ⚠️ **アプリの `src/components/collect/collectScope.ts` と同じ値を持っている。**
 *    2 リポジトリに同じ文字列があるので、**片方だけ直すと綴りがずれる。**
 *    ずれても型エラーは出ず、`normalizeScope` が `"both"` に倒すので
 *    **入力欄が黙って元に戻るだけ**という壊れ方をする。
 *
 * ⚠️ **`"use server"` のファイルに置かないこと。** Server Actions のモジュールは
 *    async 関数しか export できず、定数を置くとビルドが落ちる
 *    （`plans.js` / `expenseCategories.js` と同じ理由）。
 */
export const COLLECT_SCOPES = [
  { value: "cash", label: "現金のみ", description: "硬貨だけを記録します" },
  {
    value: "cashless",
    label: "現金以外のみ",
    description: "PayPay などで受け取ったぶんだけを記録します",
  },
  { value: "both", label: "両方", description: "現金と現金以外の両方を記録します" },
];

/**
 * URL から来た値を確かめる。
 *
 * ⚠️ **未指定は `"both"`。** 通知のディープリンクやブックマークなど
 *    `scope` を持たない経路から開かれたときに、**入力欄が黙って消えている**
 *    状態にしないため（アプリと同じ規約）。
 */
export function normalizeScope(value) {
  return COLLECT_SCOPES.some((s) => s.value === value) ? value : "both";
}

/** 硬貨・合計金額の欄を出すか */
export function showsCash(scope) {
  return scope !== "cashless";
}

/** 支払方法（キャッシュレス）の欄を出すか */
export function showsCashless(scope) {
  return scope !== "cash";
}

/**
 * その店舗で「何を集金するか」を聞くべきか。
 *
 * ⚠️ **支払方法が 1 件も無い店舗では聞かない。** 選択肢が実質「現金」しか
 *    無いのに 1 タップ増えるだけになる（アプリと同じ判断）。
 * ⚠️ **無効にした支払方法は数えない。** `attachPaymentMethods` は店舗フォームで
 *    戻せるように `isActive: false` の行も返してくる。
 */
export function hasActivePaymentMethods(store) {
  return (store?.paymentMethods ?? []).some((m) => m.isActive);
}
