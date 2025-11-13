import { useEffect, useState } from "react";
import styles from "./SelectDate.module.css";
import { getEpochTimeInSeconds } from "@/date";

export default function EpochTimeSelector({
  epoc,
  setEpoc,
  submitFunc = () => {},
}) {
  const date = new Date(epoc);
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [day, setDay] = useState(date.getDate());
  const [isEditing, setIsEditing] = useState(false);

  const years = Array.from(
    { length: 61 },
    (_, i) => date.getFullYear() - 50 + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDate = new Date(year, month - 1, day);

  const formatDate = (date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const clickHander = () => {
    setIsEditing(false);
    const epocTime = getEpochTimeInSeconds(year, month, day);
    setEpoc(epocTime);
    submitFunc(epocTime);
  };
  return (
    <div>
      {!isEditing ? (
        <div onClick={() => setIsEditing(true)} className={styles.dateDisplay}>
          <div className={styles.dateValue}>{formatDate(selectedDate)}</div>
          <div className={styles.dateHint}>クリックして変更</div>
        </div>
      ) : (
        <div className={styles.editPanel}>
          <div className={styles.editLabel}>日付を選択</div>
          <div className={styles.selectGrid}>
            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>年</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={styles.select}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>月</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className={styles.select}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectWrapper}>
              <label className={styles.selectLabel}>日</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className={styles.select}
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={clickHander} className={styles.confirmButton}>
            確定
          </button>
        </div>
      )}
    </div>
  );
}
