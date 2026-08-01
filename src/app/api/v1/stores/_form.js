/**
 * 店舗の作成・更新まわりの共通処理。
 *
 * Web の createStore() / updateStore() は FormData を受ける前提で、
 * machines と images は JSON 文字列として入っている（`formData.get("machines")` を
 * JSON.parse している）。アプリからは素の JSON で送るので、ここで詰め替える。
 * ⚠️ Server Action 側の受け取り方が変わったらここも直すこと。
 */
export function toStoreFormData(body) {
  const formData = new FormData();
  formData.set("store", body.store ?? "");
  formData.set("location", body.location ?? "");
  formData.set("description", body.description ?? "");
  formData.set("machines", JSON.stringify(body.machines ?? []));
  // images は { url, path } の配列。アプリからは画像を追加できないので、
  // 編集時は取得済みの配列をそのまま返してもらって温存する
  formData.set("images", JSON.stringify(body.images ?? []));

  /*
    ⚠️ **支払方法は送られてきたときだけ set する。** `?? []` にすると
       「送らなかった」と「全部消したい」が区別できなくなり、
       支払方法を知らないクライアントが店舗を保存した瞬間に全部無効になる。
       Server Action 側は `formData.get("paymentMethods") === null` を
       「据え置き」として見ている。
  */
  if (body.paymentMethods !== undefined) {
    formData.set("paymentMethods", JSON.stringify(body.paymentMethods));
  }
  return formData;
}

/**
 * ⚠️ App Store Guideline 3.1.3(a) 対策。
 *
 * createStore() はプラン上限に達したとき
 * 「プランの上限（N店舗）に達しています。アップグレードしてください。」を返す。
 * この文言をアプリにそのまま出すと、外部での課金導線への言及とみなされる。
 * アプリ向けには課金に触れない文言へ差し替える（Web 側の文言は変えない）。
 */
/**
 * アクションログに出す店舗名を Server Action の戻り値から取る。
 *
 * ⚠️ createStore / updateStore / deleteStore は `.select()` の書き方が揃っておらず、
 *    data が**オブジェクトのことも配列のこともある。** 片方だけ想定すると
 *    ログが「undefined店の登録が完了しました。」になる（型エラーは出ない）。
 */
export function storeNameOf(data) {
  const row = Array.isArray(data) ? data[0] : data;
  return row?.store ?? "店舗";
}

export function sanitizeStoreError(result) {
  const message = typeof result?.error === "string" ? result.error : result?.error?.msg;
  if (message && message.includes("アップグレード")) {
    return {
      error: "登録できる店舗数の上限に達しています。",
      status: 403,
    };
  }
  return result;
}
