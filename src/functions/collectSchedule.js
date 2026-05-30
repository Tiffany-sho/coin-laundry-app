// 次の集金日までの日数を計算する
export function getNextCollectDate(schedule) {
  if (!schedule || !Array.isArray(schedule.days) || schedule.days.length === 0) return null;

  const now = new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
  const todayDow = now.getDay();   // 0=日, 1=月 ... 6=土
  const todayDate = now.getDate(); // 1-31
  const year = now.getFullYear();
  const month = now.getMonth();    // 0-indexed

  if (schedule.type === "weekly") {
    const days = [...schedule.days].sort((a, b) => a - b);
    let minDiff = Infinity;
    for (const d of days) {
      let diff = d - todayDow;
      if (diff < 0) diff += 7;
      if (diff < minDiff) minDiff = diff;
    }
    return { daysUntil: minDiff };
  }

  if (schedule.type === "monthly") {
    const days = [...schedule.days].sort((a, b) => a - b);
    for (const d of days) {
      if (d >= todayDate) {
        return { daysUntil: d - todayDate };
      }
    }
    // 今月の集金日はすべて過ぎているので来月の最初の集金日を返す
    const d = days[0];
    const nextMonthDate = new Date(year, month + 1, d);
    const diffMs = nextMonthDate - now;
    return { daysUntil: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
  }

  return null;
}
