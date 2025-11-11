const EPOCH_ERROR = 32400000;

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

export const changeEpocFromNowYearMonth = () => {
  const data = Date.now();
  const nowData = new Date(data);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;

  return Date.UTC(year, month - 1, 1) - EPOCH_ERROR;
};

export const changeEpocFromNextYearMonth = () => {
  const data = Date.now();
  const nowData = new Date(data);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  return Date.UTC(year, month, 1) - EPOCH_ERROR;
};

export const changeEpocFromBackYearMonth = () => {
  const data = Date.now();
  const nowData = new Date(data);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  return Date.UTC(year, month - 2, 1) - EPOCH_ERROR;
};

export function getEpochTimeInSeconds(year, month, day) {
  return Date.UTC(year, month - 1, day) - EPOCH_ERROR;
}
