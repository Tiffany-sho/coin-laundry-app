const EPOCH_ERROR = 32400000;

export const createNowData = (data) => {
  const nowData = new Date(data + EPOCH_ERROR);

  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;
  const day = nowData.getDate();

  return `${year}/${month}/${day}`;
};

export const getYearMonth = (data) => {
  const nowData = new Date(data + EPOCH_ERROR);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;

  return `${year}-${String(month).padStart(2, "0")}`;
};

export const changeEpocFromNowYearMonth = (ago) => {
  const data = Date.now();
  const nowData = new Date(data + EPOCH_ERROR);
  const year = nowData.getFullYear();
  const month = nowData.getMonth() + 1;

  return Date.UTC(year, month - 1 + ago, 1) - EPOCH_ERROR;
};

export function getEpochTimeInSeconds(year, month, day) {
  return Date.UTC(year, month - 1, day) - EPOCH_ERROR;
}

/**
 * `getEpochTimeInSeconds()` の**逆算**。JST 深夜 0 時の epoch から年月日を戻す。
 *
 * ⚠️ **`new Date(epoch).getFullYear()` で読まないこと。** あれは端末のローカル時刻で
 *    読むので、UTC より西の端末（JST 以外）では**1 日前の日付が返る。**
 *    `getEpochTimeInSeconds` は `Date.UTC(...) - EPOCH_ERROR` なので、
 *    `+ EPOCH_ERROR` して **UTC で**読み直せば端末の TZ に関係なく元の値に戻る。
 *
 * ⚠️ `createNowData()` は表示用に「+9 時間してローカルで読む」という近似をしている。
 *    **年月日を計算に使うときはこちらを通すこと**（往復しても値が動かない）。
 */
export function getJstDateParts(epoch) {
  const shifted = new Date(epoch + EPOCH_ERROR);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}
