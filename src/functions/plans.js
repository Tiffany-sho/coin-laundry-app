/** 店舗数の上限 */
export const PLAN_LIMITS = {
  free: 3,
  pro: 5,
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
  max: Infinity,
};

export const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
};
