export const createNowData = (data) => {
  const nowData = new Date(data);
  const eraFormatter = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    year: "numeric",
  });

  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();
  return `${year}/${month}/${day}`;
};
