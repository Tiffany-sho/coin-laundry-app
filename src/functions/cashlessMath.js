// キャッシュレスまわりの算数。集金フォームと編集ドロワーの両方から使う。
//
// ⚠️ **単位が 2 つ混ざる場所。** `fundsArray[].funds` は硬貨の**枚数**（金額は × 100）、
//    `cashless[].amount` は**円**。取り違えても型エラーにならない。
//
// ⚠️ **`collect_funds.totalFunds` は総額（現金 + キャッシュレス）。**
//    一方、Server Action の `createData` / `updateData` が受け取る `totalFunds` は
//    **現金ぶん**で、サーバがキャッシュレスを足して総額を組む。
//    **同じ名前で意味が違う**ので、画面の総額をそのまま送ると二重計上になる。

/** 硬貨 1 枚の金額。⚠️ 100 円玉しか扱わない */
export const COIN_VALUE = 100;

/** `[{ amount }]` の合計（円）。null / 文字列 / 欠損に強くする */
export function sumCashless(entries) {
  return (Array.isArray(entries) ? entries : []).reduce(
    (acc, entry) => acc + (Number(entry?.amount) || 0),
    0
  );
}

/** `fundsArray` の現金ぶん（円）。⚠️ funds は枚数なので × 100 */
export function sumMachineCash(fundsArray) {
  return (
    (Array.isArray(fundsArray) ? fundsArray : []).reduce(
      (acc, row) => acc + (Number(row?.funds) || 0),
      0
    ) * COIN_VALUE
  );
}

/**
 * 既存レコードの「現金ぶん」。
 *
 * ⚠️ **これが `updateData` に渡す値。** `totalFunds`（総額）をそのまま渡すと、
 *    サーバがキャッシュレスを足し直して**保存のたびに総額がその分だけ増える。**
 *    表示は総額・入力は現金ぶん、と同じ画面で単位が変わるのが事故の入口。
 *
 * ⚠️ **負を 0 に丸めない。** 過去データのずれ（キャッシュレスが総額を上回る）を
 *    握り潰すと、合計が合わないことに気づけなくなる。
 */
export function cashPortion(record) {
  return (Number(record?.totalFunds) || 0) - sumCashless(record?.cashless);
}

/** 機器ごとのキャッシュレスを持つ集金か。⚠️ true のときは集金レベルの内訳を編集させない */
export function hasMachineCashless(fundsArray) {
  return (Array.isArray(fundsArray) ? fundsArray : []).some(
    (row) => Array.isArray(row?.cashless) && row.cashless.length > 0
  );
}

/**
 * 画面の入力（`{ [methodId]: "1200" }`）を Server Action が受け取る形へ。
 *
 * ⚠️ **0 円と空欄は落とす。** サーバも 0 を捨てるが、送らないほうが
 *    「入力しなかった」ことが素直に伝わる。
 * ⚠️ **`name` は送らない。** サーバが `methodId` から引き直す（クライアントの
 *    名前を信じると、過去の集金に出る表示名を自由に差し替えられる）。
 */
export function toCashlessPayload(values) {
  return Object.entries(values ?? {})
    .map(([methodId, raw]) => ({ methodId, amount: Number(raw) }))
    .filter((entry) => Number.isInteger(entry.amount) && entry.amount > 0);
}

/**
 * 編集欄に並べる支払方法の行。
 *
 * ⚠️ **記録に残っている方法は、使用停止でも必ず並べる。** 並べないと
 *    **金額を 0 に戻すことすらできず、消せない内訳が残る。**
 * ⚠️ 突き合わせは `methodId`。同じ名前の方法が別店舗にあり得るので名前では寄せない。
 *
 * ⚠️ **`recorded` が false の行は「まだ使っていない方法」。** 常に並べると、現金だけの
 *    集金でも支払方法の数だけ ¥0 が並んで**何を直せばよいか分からなくなる。**
 *    画面側はこれを見て畳むこと。
 *
 * @returns {{ id: string, name: string, amount: number, retired: boolean,
 *             recorded: boolean }[]}
 */
export function buildMethodRows(recorded, storeMethods) {
  const rows = [];
  const seen = new Set();

  for (const entry of Array.isArray(recorded) ? recorded : []) {
    const id = entry?.methodId == null ? "" : String(entry.methodId);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const current = (storeMethods ?? []).find((m) => String(m.id) === id);
    rows.push({
      id,
      // 名前は現在の登録を優先し、消えていれば記録に焼き込まれたものに落とす
      name: current?.name ?? entry?.name ?? "（削除された支払方法）",
      amount: Number(entry?.amount) || 0,
      retired: !current || current.isActive === false,
      recorded: true,
    });
  }

  // まだ記録に無い、いま受け付けている方法
  for (const method of storeMethods ?? []) {
    const id = String(method?.id ?? "");
    if (!id || seen.has(id) || method?.isActive === false) continue;
    seen.add(id);
    rows.push({ id, name: method.name, amount: 0, retired: false, recorded: false });
  }

  return rows;
}
