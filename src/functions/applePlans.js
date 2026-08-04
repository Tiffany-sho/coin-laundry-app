/**
 * App Store の商品 ID とプランの対応。
 *
 * ⚠️ **App Store Connect で作る商品 ID とこの文字列が 1 文字でも違うと、
 *    購入は成立するのにプランが上がらない**（PLAN_BY_PRODUCT_ID の引きが
 *    undefined になり free 扱いになる）。エラーにはならないので気づきにくい。
 *
 * ⚠️ 同じ定義が iOS 側の `src/billing/products.ts` にもある。リポジトリを
 *    跨いでいるので、片方を直したら必ず両方直すこと（date.js と同じ事情）。
 *
 * ⚠️ 商品 ID は App Store Connect で一度作ると**二度と変更・再利用できない**。
 *    命名を決め直したくなっても既存 ID は消せないので、最初に確定させること。
 *
 * ⚠️ **`pro` のキーと商品 ID の綴りが揃っていないのは意図的**（2026-08-04）。
 *    順位（Level）の設定を直すために `com.collecie.app.pro.monthly` を作り直せず、
 *    `...pronormal.monthly` を新規に作ったため。
 *    **プランのキーを `pronormal` に変えないこと。** `organizations.plan` の
 *    CHECK 制約（010）・`PLAN_LIMITS`・`PLAN_MEMBER_LIMITS`・`PLAN_NAMES`・
 *    既存の行がすべて `pro` を使っており、変えるとマイグレーションが要る。
 */
export const APPLE_PRODUCT_IDS = {
  pro: "com.collecie.app.pronormal.monthly",
  proplus: "com.collecie.app.proplus.monthly",
  max: "com.collecie.app.max.monthly",
};

/**
 * 過去に使っていた商品 ID。
 *
 * ⚠️ **消さないこと。** 既に購入された取引は今もこの ID を名乗ってくるし、
 *    App Store Server Notification も古い ID で飛んでくる。落とすと
 *    `toPlanPatch` が null を返して **「未知の商品です」で 400**になる。
 */
export const LEGACY_APPLE_PRODUCT_IDS = {
  "com.collecie.app.pro.monthly": "pro",
};

/** ⚠️ 現行の ID が勝つように、legacy を先に展開する */
export const PLAN_BY_PRODUCT_ID = {
  ...LEGACY_APPLE_PRODUCT_IDS,
  ...Object.fromEntries(
    Object.entries(APPLE_PRODUCT_IDS).map(([plan, productId]) => [productId, plan])
  ),
};

/** 購読グループ。アップグレード / ダウングレードを Apple 側で処理させるため 1 つにまとめる */
export const APPLE_SUBSCRIPTION_GROUP = "collecie_plan";

/**
 * 猶予期間（Billing Grace Period）を考慮した失効判定。
 *
 * ⚠️ expiresDate ちょうどで切らない。Apple は決済失敗時に数日ぶんの猶予を
 *    与えたうえで通知してくるが、通知が遅れることがある。ここで数分の
 *    余裕を持たせておかないと、更新の瞬間に一時的に free へ落ちて
 *    「店舗が使えない」という問い合わせになる。
 */
const EXPIRY_SLACK_MS = 10 * 60 * 1000;

export function isAppleSubscriptionActive(expiresAtMs, now = Date.now()) {
  if (!expiresAtMs) return false;
  return expiresAtMs + EXPIRY_SLACK_MS > now;
}
