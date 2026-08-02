import {
  PLAN_LIMITS,
  PLAN_MEMBER_LIMITS,
  PLAN_NAMES,
  PLAN_RANK,
  planAtLeast,
} from "./plans";

/**
 * プラン表に**書いてよい内容**の正。料金表・設定画面・構造化データ・規約は
 * すべてここから引く。
 *
 * ⚠️ **画面ごとに機能一覧を手書きしないこと。** 2026-08-03 まで LP の料金表・
 *    `/settings/plan` の表・トップの構造化データ・規約の 4 か所に別々の一覧が
 *    あり、次のように食い違っていた（どれも型エラーにならない）:
 *      - `/settings/plan` の Max にだけ「優先サポート」。**提供の裏付けが無い**
 *        うえ LP の表には無く、2 つの表が矛盾していた
 *      - `/settings/plan` に「CSV/Excelエクスポート」が無く、**実在する有料機能**が
 *        Free と Pro の差として伝わっていなかった
 *      - LP で Pro のメンバー招待にだけ「無制限」が付いておらず、Pro だけ
 *        人数制限があるように読めた（実際は Pro 以上すべて無制限）
 *
 * ⚠️ **可否の正はここではない。** 実際に止めているのは Server Action と
 *    API Route（`PLAN_LIMITS` / `PLAN_MEMBER_LIMITS` / `plan === "free"`）。
 *    ここはそれを**表示に翻訳するだけ**で、判定は同じ表から導いている。
 */

/** 安い順。⚠️ `PLAN_RANK` の順と一致していること（テストで固定） */
export const PLAN_ORDER = ["free", "pro", "proplus", "max"];

/**
 * 月額（税込・円）。
 *
 * ⚠️ **これは Web（Stripe）の価格。** アプリ内課金で表示してよいのは StoreKit が
 *    返した `displayPrice` だけなので、iOS 側にこの値を持ち込まないこと
 *    （地域・為替・Apple の価格改定でずれる。Guideline 3.1.2）。
 */
export const PLAN_PRICES = {
  free: 0,
  pro: 800,
  proplus: 1500,
  max: 3000,
};

/** 課金対象のプラン（安い順）。特商法・規約の価格一覧はこれを回して作る */
export const PAID_PLANS = PLAN_ORDER.filter((plan) => PLAN_PRICES[plan] > 0);

export function priceLabel(plan) {
  return `¥${(PLAN_PRICES[plan] ?? 0).toLocaleString("ja-JP")}`;
}

/** 「Proプラン：¥800/月（税込）」の行を有料プランぶん。掲示義務のある一覧用 */
export function paidPriceLines() {
  return PAID_PLANS.map(
    (plan) => `${PLAN_NAMES[plan]}プラン：${priceLabel(plan)}/月（税込）`
  );
}

/** 「Pro・Pro+・Max」。規約の本文で有料プランを列挙するときに使う */
export function paidPlanNames() {
  return PAID_PLANS.map((plan) => PLAN_NAMES[plan]).join("・");
}

export function storeLimitLabel(plan) {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  return Number.isFinite(limit) ? `${limit}店舗まで` : "無制限";
}

/**
 * メンバーを招待できるか。
 *
 * ⚠️ **`plan !== "free"` と書かないこと。** 上限の表（`PLAN_MEMBER_LIMITS`）から
 *    導いておけば、あとで「Pro は 5 人まで」のような刻みを入れても表示が自動で追随する。
 */
export function canInviteMembers(plan) {
  const limit = PLAN_MEMBER_LIMITS[plan] ?? PLAN_MEMBER_LIMITS.free;
  return limit > 1;
}

/** 招待できるときだけ人数の表記を返す。招待できないプランは null */
export function memberLimitLabel(plan) {
  if (!canInviteMembers(plan)) return null;
  const limit = PLAN_MEMBER_LIMITS[plan];
  return Number.isFinite(limit) ? `${limit}人まで` : "無制限";
}

/**
 * 比較表の行。**ここに無いものを画面に書き足さない。**
 *
 * ⚠️ `included` は必ず上限の表か `planAtLeast` から導くこと。プラン名を並べて
 *    書くと、プランを 1 つ足したときに直し漏れた行だけ嘘になる。
 */
const ROWS = [
  { key: "stores", label: "店舗数", included: () => true, value: storeLimitLabel },
  { key: "collect", label: "集金記録", included: () => true },
  { key: "inventory", label: "在庫管理", included: () => true },
  { key: "equipment", label: "機器状態管理", included: () => true },
  { key: "chart", label: "売上グラフ", included: () => true },
  {
    key: "export",
    label: "CSV/Excelエクスポート",
    /* サーバ側は `plan === "free"` で弾いている（collect-csv / collect-xlsx / v1/funds/export） */
    included: (plan) => planAtLeast(plan, "pro"),
  },
  {
    key: "members",
    label: "チームメンバー招待",
    included: canInviteMembers,
    value: memberLimitLabel,
  },
];

/** 比較表 1 列ぶん。`ok` が false の行も残す（何が付かないかを見せるため） */
export function planRows(plan) {
  return ROWS.map(({ key, label, included, value }) => {
    const ok = included(plan);
    return {
      key,
      label,
      ok,
      // 使えない行に値を出すと「5店舗まで使えない」のように読めるので空にする
      value: ok && value ? (value(plan) ?? "") : "",
    };
  });
}

/**
 * そのプランで使えるものだけの短い一覧（設定画面のカード用）。
 * 店舗数はカード内で別に大きく出すので除く。
 */
export function planFeatureList(plan) {
  return planRows(plan)
    .filter((row) => row.ok && row.key !== "stores")
    .map((row) => (row.value ? `${row.label}（${row.value}）` : row.label));
}

/**
 * 構造化データ用の一文。
 *
 * ⚠️ 店舗数だけは主語を補う。表の中なら「無制限」で通じるが、地の文に並べると
 *    何が無制限なのか分からなくなる。
 */
export function planSummary(plan) {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const stores = Number.isFinite(limit) ? storeLimitLabel(plan) : "店舗数無制限";
  return [stores, ...planFeatureList(plan)].join("・");
}

/**
 * 無料トライアルが付くプラン。
 *
 * ⚠️ **Pro だけ。** Apple の導入オファーは購読グループ単位で 1 回しか使えないので、
 *    Pro で試した人は Pro+ では受けられない。両方に付けると表示と実際が食い違う。
 * ⚠️ Web 側の実際の日数は `STRIPE_PRO_TRIAL_DAYS`（現在 183 日）。**環境変数は
 *    クライアントから読めない**ので表記はここに持っている。片方だけ変えないこと。
 */
export const TRIAL_PLAN = "pro";
/** 「6か月」。文言を組み立てる側はこれを埋め込むこと（表記ゆれを作らない） */
export const TRIAL_PERIOD_LABEL = "6か月";
export const TRIAL_LABEL = `${TRIAL_PERIOD_LABEL}無料トライアル`;

export function trialLabel(plan) {
  return plan === TRIAL_PLAN ? TRIAL_LABEL : null;
}

/** 表示順の検証用（テストから参照） */
export const PLAN_ORDER_BY_RANK = [...PLAN_ORDER].sort(
  (a, b) => PLAN_RANK[a] - PLAN_RANK[b]
);
