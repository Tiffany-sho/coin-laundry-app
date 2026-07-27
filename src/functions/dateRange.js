// 集金データの期間フィルタを Supabase クエリに適用する共通ヘルパー。
//
// 【なぜ必要か】
// collect_funds.date は SelectDate が getEpochTimeInSeconds() で生成した
// 「JST 深夜0時ちょうど」の epoch。境界値がレコードの値と完全一致するため、
// .gt / .gte の取り違えがそのまま「まる1日分の欠落」になる。
// 実際、開始日に .gt を使っていた箇所では毎月1日の集金が合計から抜けていた。
//
// 【規約】
//   開始日 … 常に含む（.gte）
//   終了日 … endMode で切り替える
//     "exclusive"（既定）… endEpoch が範囲外の起点を指す場合。
//                          例: 期間スライダーや月次集計の「翌月1日」
//     "inclusive"        … endEpoch が選択された最終日そのものを指す場合。
//                          例: エクスポート画面で指定した終了日

export const END_EXCLUSIVE = "exclusive";
export const END_INCLUSIVE = "inclusive";

export function applyDateRange(query, startEpoch, endEpoch, { endMode = END_EXCLUSIVE } = {}) {
  let q = query;

  if (startEpoch !== null && startEpoch !== undefined) {
    q = q.gte("date", startEpoch);
  }

  if (endEpoch !== null && endEpoch !== undefined) {
    q = endMode === END_INCLUSIVE ? q.lte("date", endEpoch) : q.lt("date", endEpoch);
  }

  return q;
}
