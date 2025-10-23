export const createNowData = (data) => {
  const nowData = new Date(data);

  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();
  return `${year}/${month}/${day}`;
};

export function getEpochTimeInSeconds(year, month, day) {
  return Date.UTC(year, month - 1, day) ;
}