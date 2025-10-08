export const createNowData = (data) => {
  const nowData = new Date(data);
  const eraFormatter = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    year: "numeric",
  });

  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();

  const hours = String(nowData.getHours()).padStart(2, "0");
  const minutes = String(nowData.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};
