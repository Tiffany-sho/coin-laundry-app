/**
 * 店舗数の上限。
 *
 * ⚠️ **プランのキーは 4 つ**（2026-08-03 に `proplus` を足した）。
 *    キーは Apple の商品 ID の中身（`com.collecie.app.proplus.monthly`）と
 *    揃えてある。`PLAN_BY_PRODUCT_ID` が商品 ID からこのキーを引いて
 *    `organizations.plan` にそのまま入れるので、**綴りが違うと購入は成立するのに
 *    プランが上がらない**（引きが undefined になり free 扱い）。
 */
export const PLAN_LIMITS = {
  free: 3,
  pro: 5,
  proplus: 10,
  max: Infinity,
};

/**
 * 組織のメンバー数の上限。**free は本人 1 人だけ**（＝招待できない）。
 *
 * プラン表（アプリの PlanCards.tsx / Web の料金表）で「メンバーの招待」を
 * Pro 以上の機能として出しているので、free では人を増やせないのが正。
 *
 * ⚠️ **PLAN_LIMITS（店舗数）と取り違えないこと。** 名前が似ているうえ
 *    どちらも同じ plan キーで引くので、間違えても例外にならず
 *    「店舗が 1 件しか作れない」「メンバーが 3 人まで入れる」という形で静かに壊れる。
 *
 * ⚠️ **判定するのは「増やすとき」だけ。** プランを下げても既存メンバーは外さない
 *    （上限を超えたまま留まるのを許容する）。外すと、支払いを止めた瞬間に
 *    集金担当者がアプリを開けなくなって現場が止まる。
 */
export const PLAN_MEMBER_LIMITS = {
  free: 1,
  pro: Infinity,
  proplus: Infinity,
  max: Infinity,
};

export const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  proplus: 'Pro+',
  max: 'Max',
};

/**
 * プランの序列。上げるのか下げるのかの判定に使う。
 *
 * ⚠️ **アプリの `src/billing/products.ts` の `PLAN_RANK` と同じ順にすること。**
 *    片方だけ直すと、アップグレードのつもりの購入がダウングレード扱いになる
 *    （StoreKit へ渡す置き換えモードが変わる）。
 */
export const PLAN_RANK = {
  free: 0,
  pro: 1,
  proplus: 2,
  max: 3,
};

/**
 * `plan` が `min` 以上か。**有料機能の出し分けはこれを通すこと。**
 *
 * ⚠️ **`plan === "pro" || plan === "max"` と書かない。** プランを 1 つ足すたびに
 *    全部の出し分けを直して回ることになり、**直し漏れた画面だけ機能が消える。**
 *    実際 2026-08-03 に Pro+ を足したとき、書き出しボタンが 3 か所とも
 *    Pro+ を弾いていた（サーバは `plan === "free"` で判定していたので通るのに、
 *    ボタンが出ないという食い違い方をする）。
 */
export function planAtLeast(plan, min) {
  return (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[min] ?? 0);
}

/**
 * `plan` から上げられるプランを**安い順**に返す。最上位なら空配列。
 *
 * ⚠️ **`free` は返さない。** 序列の 0 なので上位には来ないが、
 *    知らないプラン名が来たときも 0 扱いになるため、明示的に除いてある。
 *    除かないと「Free にアップグレード」というボタンが出うる。
 */
export function upgradeTargetsFrom(plan) {
  const current = PLAN_RANK[plan] ?? 0;
  return Object.keys(PLAN_RANK)
    .filter((key) => key !== 'free' && PLAN_RANK[key] > current)
    .sort((a, b) => PLAN_RANK[a] - PLAN_RANK[b]);
}
