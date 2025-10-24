export const createNowData = (data) => {
  const nowData = new Date(data);

  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();
  return `${year}/${month}/${day}`;
};

export const getYearMonth = (data) => {
  const nowData = new Date(data);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
};

export function getEpochTimeInSeconds(year, month, day) {
  return Date.UTC(year, month - 1, day);
}
