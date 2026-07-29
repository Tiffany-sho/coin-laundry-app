/**
 * iOS アプリの WebView から開くページ。
 *
 * ここに載せたパスは Navbar / FooterNavbar / Footer を出さない
 * （NavVisibilityWrapper が参照している）。理由は 2 つ:
 *
 * 1. アプリの中にサイトのナビが出ると二重のナビになって操作が混乱する
 * 2. ⚠️ **ナビからプラン・料金のページへ辿れてしまう。**
 *    App Store Guideline 3.1.3(a)（アプリ外の購入手段への誘導）に触れるため、
 *    アプリ内で表示するページからは価格・決済・アップグレードへ**到達できてはならない**。
 *
 * アプリ側も onShouldStartLoadWithRequest で同じパスだけを許可している
 * （coinlaundy_app_iOS の app/settings/webview.tsx）。片方だけ直しても意味がないので、
 * 増やすときは両方に足すこと。
 */
export const APP_LEGAL_PATHS = ["/app/terms", "/app/privacy"];

export function isAppLegalPath(pathname) {
  return APP_LEGAL_PATHS.includes(pathname);
}
