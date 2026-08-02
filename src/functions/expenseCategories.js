/**
 * 経費のカテゴリ。
 *
 * ⚠️ **`"use server"` のファイルに置かないこと。** Server Actions のモジュールは
 *    **async 関数しか export できない**ので、定数を export した瞬間にビルドが落ちる
 *    （`Failed to collect page data for …` としか出ず、原因が分かりにくい）。
 *    実際に expenses/action.js に置いてビルドを壊した。
 *
 * ⚠️ **アプリの `src/components/expenses/categories.ts` と同じ綴りにすること。**
 *    2 リポジトリに同じ文字列を持っている（商品 ID と同じ罠）。サーバはこの配列に
 *    含まれるかで弾くので、1 文字でもずれると「カテゴリが不正です」で登録できなくなる。
 */
export const EXPENSE_CATEGORIES = [
  "仕入れ",
  "水道光熱費",
  "家賃",
  "修繕費",
  "消耗品費",
  "通信費",
  "広告宣伝費",
  "支払手数料",
  "その他",
];

/** 既定のカテゴリ。⚠️ 在庫の仕入れがいちばん多いので先頭に置いてある */
export const DEFAULT_EXPENSE_CATEGORY = EXPENSE_CATEGORIES[0];

/**
 * カテゴリごとの色。一覧と内訳グラフの目印。
 * ⚠️ アプリの `src/components/expenses/categories.ts` と同じ値にすること。
 */
const CATEGORY_COLOR = {
  仕入れ: "#0891B2",
  水道光熱費: "#F59E0B",
  家賃: "#8B5CF6",
  修繕費: "#EF4444",
  消耗品費: "#10B981",
  通信費: "#3B82F6",
  広告宣伝費: "#EC4899",
  支払手数料: "#6B7280",
  その他: "#94A3B8",
};

/**
 * ⚠️ 未知のカテゴリ（あとから増やした・古いデータ）も来うるので必ず既定色に落とす。
 *    Object.prototype 由来のキーを拾わないよう hasOwnProperty で確かめる。
 */
export function categoryColor(category) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_COLOR, category)
    ? CATEGORY_COLOR[category]
    : CATEGORY_COLOR["その他"];
}
