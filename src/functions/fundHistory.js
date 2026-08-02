/**
 * 売上履歴の絞り込み。
 *
 * ⚠️ **絞り込みは表示だけの話で、取得範囲は変えない。** サーバから返ってきた行を
 *    そのまま畳んでいるので、「さらに表示」で増えた行にも同じ条件がかかる。
 *    取得側に条件を渡す作りにすると、月ごとの合計が「絞り込んだ人ぶんだけ」になり、
 *    ヘッダの合計と履歴の中身が食い違う。
 */

/**
 * 集金者の選択肢。`collecter`（uuid）で束ね、表示名は profiles.username。
 *
 * ⚠️ **uuid で束ねる。名前で束ねない。** 同姓同名が別人として扱えなくなるうえ、
 *    表示名は後から変更できるので過去の行と現在の行で割れる。
 *
 * ⚠️ 退会したメンバーの行は username が無い。除外せず「不明」として残す
 *    （その人の集金が履歴から消えると合計と合わなくなる）。
 */
export function collecterOptions(rows) {
  const byId = new Map();

  for (const row of rows ?? []) {
    const id = row?.collecter;
    if (!id) continue;
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name: row?.profiles?.username || "（不明）",
        count: 0,
      });
    }
    byId.get(id).count += 1;
  }

  // 件数の多い順。同数なら名前順で安定させる
  return [...byId.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja")
  );
}

/**
 * 集金者で絞り込む。`collecterId` が null / undefined なら素通し。
 *
 * ⚠️ 素通しのときは**元の配列をそのまま返す。** 毎回新しい配列を作ると、
 *    参照が変わって下流の useEffect が無駄に再実行される。
 */
export function filterByCollecter(rows, collecterId) {
  if (!collecterId) return rows ?? [];
  return (rows ?? []).filter((row) => row?.collecter === collecterId);
}
