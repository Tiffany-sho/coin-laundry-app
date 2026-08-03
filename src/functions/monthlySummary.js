// 月次サマリー（前月比・前年同月比）の純粋ロジック。
//
// ⚠️ **2026-08-03 に「月次サマリー」のタブを「月別利益」へ差し替えた**ので、
//    `computeChanges`（前月比・前年同月比）は**今どの画面からも呼ばれていない。**
//    残してあるのは `groupByMonth` が MonthlyProfitCard から使われているため。
//    ⚠️ 前月比を出す画面を作るときは、消さずにここから使うこと。

const EPOCH_OFFSET = 32400000; // JST +9h

// 集金履歴を年月ごとに合算し、年月キーの昇順で返す
export function groupByMonth(records) {
  const map = new Map();
  records.forEach(({ date, totalFunds }) => {
    const d = new Date(date + EPOCH_OFFSET);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth() + 1;
    const key = `${y}-${String(mo).padStart(2, "0")}`;
    const label = `${y}年${mo}月`;
    if (!map.has(key)) map.set(key, { key, label, total: 0 });
    map.get(key).total += totalFunds;
  });
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

// 各月に前月比 (mom) と前年同月比 (yoy) を付与する。
// 比較対象が存在しない・0円の場合は null（UI側では「—」表示）。
export function computeChanges(months) {
  return months.map((m, i) => {
    const prev = i > 0 ? months[i - 1] : null;
    const mom =
      prev && prev.total > 0
        ? ((m.total - prev.total) / prev.total) * 100
        : null;

    const [y, mo] = m.key.split("-").map(Number);
    const yoyKey = `${y - 1}-${String(mo).padStart(2, "0")}`;
    const yoyEntry = months.find((x) => x.key === yoyKey);
    const yoy =
      yoyEntry && yoyEntry.total > 0
        ? ((m.total - yoyEntry.total) / yoyEntry.total) * 100
        : null;

    return { ...m, mom, yoy };
  });
}
