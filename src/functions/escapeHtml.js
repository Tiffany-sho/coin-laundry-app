/**
 * HTML の文脈に文字列を差し込むためのエスケープ。属性値も本文も同じ扱いで足りる。
 *
 * ⚠️ **自由入力を生のままメール本文へ入れないこと。** Resend は script こそ落とすが
 *    **アンカーは残す**ので、自分のドメインから出るメールの中に他所へのリンクを
 *    作られる（受け取るのが運営者だけでも、そこを騙す経路になる）。
 *
 * ⚠️ `white-space: pre-wrap` は改行を残すだけで**エスケープではない**。
 *    タグはそのまま解釈される。実際 feedback がこれで素通しになっていた。
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
