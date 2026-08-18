/**
 * iOS アプリ（App Store）への導線。
 *
 * ⚠️ **URL を入れるまで導線は 1 つも描かれない。** 空文字のあいだ
 *    `hasAppStoreLink()` が false を返し、呼び出し側が丸ごと出さない。
 *    **App ID が分かる前にデプロイしても壊れたリンクが出ない**ようにしてある。
 *
 * ⚠️ **App ID は App Store Connect でしか分からない**（アプリ情報 → 一般情報 →
 *    Apple ID の数字）。製品ページの URL をそのまま貼ってもよい。
 *
 * ⚠️ **これは Web 専用。iOS アプリ側に同じ導線を作らないこと。**
 *    アプリの中に「App Store で入手」を出しても意味が無いうえ、
 *    `src/content/legal/` を取り込んだときに**アプリから外部へ出るリンクを
 *    すべて無くした**経緯がある（docs/traps.md の「App Store 審査」）。
 *
 * ⚠️ **お知らせ（announcements）の本文に URL を書かない。** あちらは
 *    Web もアプリもプレーンテキストをそのまま描くだけなので、
 *    **リンクにならず長い文字列が挟まるだけ**になる。導線はここに置く。
 */

/**
 * 例: "https://apps.apple.com/jp/app/collecie/id1234567890"
 * ⚠️ **空のままにしない。** 分かった時点でここだけ直せばよい。
 */
export const APP_STORE_URL = "";

/** 導線を出してよいか。⚠️ 呼び出し側は必ずこれで包むこと */
export function hasAppStoreLink() {
  return typeof APP_STORE_URL === "string" && APP_STORE_URL.startsWith("https://");
}
