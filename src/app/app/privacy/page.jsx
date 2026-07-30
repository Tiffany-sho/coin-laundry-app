import PrivacyPage from "@/app/privacy/page";

export const metadata = {
  title: "プライバシーポリシー | Collecie",
  // 検索結果に本家 /privacy と 2 つ並ぶのを防ぐ。これはアプリ内表示専用
  robots: { index: false, follow: false },
};

/**
 * iOS アプリの WebView 用のプライバシーポリシー。
 *
 * ⚠️ 本文は /privacy をそのまま描画する。**内容を写経しないこと。**
 *    法務文書が 2 か所にあると、片方だけ直して食い違う。
 *
 * ⚠️ **ただし iOS アプリ側には複製がある**（coinlaundy_app_iOS/src/content/legal/privacy.ts）。
 *    2026-07-30 に表示速度を優先して例外を認めたもの。/privacy を直したら
 *    あちらも直すこと。Web 側でこれ以上増やさない。
 *    このパスで違うのは 2 点だけ:
 *      - ナビ・フッターが出ない（appLegalPaths.js）
 *      - 「戻る」リンクが出ない（LegalBackLink が /app/* を見て消す）
 *
 * 決済処理者（Stripe）への言及は残してある。個人情報の取扱いの開示であって
 * 購入への導線ではないため、Guideline 3.1.3(a) の対象ではない。
 */
export default function AppPrivacyPage() {
  return <PrivacyPage />;
}
