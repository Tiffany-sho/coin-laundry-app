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
