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

/**
 * 売上履歴の並び替えの軸。⚠️ **アプリの `HistoryControls.tsx` と同じ 2 つに揃えること。**
 *
 * `defaultAsc` はその軸に切り替えた直後の向き。
 * ⚠️ `upOrder`（Web）と `direction === "asc"`（アプリ）は同じ意味。
 */
export const SORT_AXES = [
  { value: "date", label: "集金日", hint: { desc: "新しい順", asc: "古い順" }, defaultAsc: false },
  { value: "totalFunds", label: "売上", hint: { desc: "高い順", asc: "低い順" }, defaultAsc: false },
];

/**
 * 軸を押したときの次の並び順。
 *
 * ⚠️ **効いている軸をもう一度押したら「反転」、別の軸なら「既定の向き」。**
 *    どちらも既定に戻すと、日付の古い順を見ている途中で売上に切り替えて戻したときに
 *    向きが黙って変わる。アプリの `SortControls` と同じ規則にしてある。
 */
export function nextSort({ orderAmount, upOrder }, axisValue) {
  if (axisValue === orderAmount) return { orderAmount, upOrder: !upOrder };
  const axis = SORT_AXES.find((a) => a.value === axisValue);
  return { orderAmount: axisValue, upOrder: axis ? axis.defaultAsc : false };
}

/**
 * 一度に出す量。
 *
 * ⚠️ **これは受け取ったあとの出し分けであって、取得する範囲ではない。**
 *    並び替えは常に全データに対してサーバが済ませてある。ここを絞っても
 *    「売上が高い順」の先頭は全期間の最高額のまま。
 *
 * ⚠️ **取得を 2 か月ずつにしないこと。** 2026-08-03 まで Web はそうなっていて、
 *    「売上が高い順」が**読み込んだ 2 か月の中の最高額**を指していた。
 *    さらに「さらに表示」で古い塊を末尾に**継ぎ足していた**ので、
 *    売上順のときは**全体としては並んでいない**列ができていた
 *    （塊ごとには並んでいるが、2 つ目の先頭が 1 つ目の末尾より大きい）。
 *    ⚠️ 集金の無い 2 か月に当たると打ち切られ、それより古い履歴に二度と届かなかった。
 *
 * 日付順は月でまとまるので月単位、売上順は月に意味が無いので件数で刻む。
 * ⚠️ アプリ（`src/components/revenue/historyRows.ts`）と同じ値にすること。
 */
export const MONTHS_PER_PAGE = 3;
export const ROWS_PER_PAGE = 50;

/** 「さらに表示」の初期値・1 回ぶん。日付順なら月数、売上順なら件数 */
export function initialLimit(grouped) {
  return grouped ? MONTHS_PER_PAGE : ROWS_PER_PAGE;
}

/**
 * 表示する行に切り詰める。
 *
 * ⚠️ **日付順（`grouped`）は「月数」で数える。** 件数で切ると月の途中で切れて、
 *    月の見出しに出す合計と、その下に並ぶ行の和が食い違う。
 *
 * @returns {{ rows: object[], remaining: number, unit: "month" | "row" }}
 */
export function limitRows(rows, limit, grouped) {
  const all = Array.isArray(rows) ? rows : [];
  if (!grouped) {
    return {
      rows: all.slice(0, limit),
      remaining: Math.max(all.length - limit, 0),
      unit: "row",
    };
  }

  const months = [];
  for (const row of all) {
    const key = monthKeyOf(row.date);
    if (!months.includes(key)) months.push(key);
  }
  const shown = new Set(months.slice(0, limit));
  return {
    rows: all.filter((row) => shown.has(monthKeyOf(row.date))),
    remaining: Math.max(months.length - limit, 0),
    unit: "month",
  };
}

/**
 * epoch（JST 深夜 0 時）が属する月のキー。
 * ⚠️ **数値だけで組み立てる。** 文字列を経由すると環境ごとにパースが割れる。
 */
function monthKeyOf(epoch) {
  const d = new Date((Number(epoch) || 0) + 32_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
