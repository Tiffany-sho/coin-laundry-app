/**
 * リクエストが**実際に叩かれた宛先**（ブラウザのアドレスバー側）の origin を返す。
 *
 * ⚠️ **`new URL(req.url).origin` を使わないこと。** dev サーバーを
 *    `-H 0.0.0.0` で起動すると `req.url` が `http://0.0.0.0:3000/...` になる。
 *    そこへリダイレクトすると **ERR_ADDRESS_INVALID**（`0.0.0.0` は待ち受け用の
 *    アドレスで、ブラウザからは到達できない）。
 *    2026-08-18 にサインアウトで実際に踏んだ。スマホ確認のために
 *    `-H 0.0.0.0` で立てると必ず再現する。
 *
 * ⚠️ **プロキシ越し（Vercel）では `x-forwarded-host` が正。** `host` のほうは
 *    内部のホスト名になりうるので、forwarded を先に見る。
 */

/** ⚠️ プロキシが無い＝手元。`https` に倒すと dev で繋がらなくなる */
const LOCAL_HOST =
  /^(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/;

/**
 * @param headers `Headers`（`get()` を持つもの）でも素のオブジェクトでも可
 * @param fallbackOrigin ホストが分からないときに返す値
 */
export function originFromHeaders(headers, fallbackOrigin = "") {
  const get = (key) => {
    if (!headers) return null;
    if (typeof headers.get === "function") return headers.get(key);
    return headers[key] ?? null;
  };

  const host = get("x-forwarded-host") ?? get("host");
  if (!host) return fallbackOrigin;

  /*
    ⚠️ **`0.0.0.0` が host に入っていたら諦めて fallback。** ブラウザが送ることは
       無いが、内部から叩かれた場合にそのまま返すと同じ事故になる。
  */
  if (host.startsWith("0.0.0.0")) return fallbackOrigin;

  const proto = get("x-forwarded-proto") ?? (LOCAL_HOST.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * リクエストから `path` への絶対 URL を作る。リダイレクト先に使う。
 * ⚠️ `path` は必ず `/` 始まりで渡すこと（外部への誘導を作らないため）。
 */
export function absoluteUrl(request, path = "/") {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const origin = originFromHeaders(request?.headers, new URL(request.url).origin);
  return `${origin}${safePath}`;
}
