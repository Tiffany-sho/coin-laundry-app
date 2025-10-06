export const createNowData = (nowData) => {
  const eraFormatter = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    year: "numeric",
  });
  const japaneseYear = eraFormatter.format(nowData);

  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();

  const hours = String(nowData.getHours()).padStart(2, "0");
  const minutes = String(nowData.getMinutes()).padStart(2, "0");
  const seconds = String(nowData.getSeconds()).padStart(2, "0");

  return `${japaneseYear}${month}月${day}日${hours}時${minutes}分${seconds}秒`;
};
