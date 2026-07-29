import { SignedDataVerifier, Environment } from "@apple/app-store-server-library";
import { APPLE_ROOT_CAS } from "./rootCerts";

/**
 * StoreKit の署名済みデータ（JWS）を検証してペイロードを取り出す。
 *
 * アプリから送られてくる購入情報は**そのまま信じてはいけない**。JWS の署名を
 * Apple のルート CA まで辿って検証し、bundleId が自分のものであることまで
 * 確かめて初めてプランを書き換えてよい。
 */

/** app.json の ios.bundleIdentifier と一致させること */
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID ?? "com.collecie.app";

/**
 * App Store Connect > App 情報 > 一般情報 の「Apple ID」（数字だけの ID）。
 * ⚠️ Production の検証には**必須**。無いと SignedDataVerifier の生成時点で落ちる。
 *    Sandbox だけなら未設定でも動くので、実装初期は未設定のまま進められる。
 */
const APP_APPLE_ID = process.env.APPLE_APP_APPLE_ID
  ? Number(process.env.APPLE_APP_APPLE_ID)
  : undefined;

/**
 * 失効証明書の照会（OCSP）を行うか。
 * 本番は true が望ましいが Apple への往復が増える。ローカルで Apple に
 * 出られない環境では false にしておく。
 */
const ONLINE_CHECKS = process.env.APPLE_IAP_ONLINE_CHECKS !== "false";

/** environment ごとに 1 つずつ作って使い回す（生成コストが高い） */
const verifiers = new Map();

function getVerifier(environment) {
  if (verifiers.has(environment)) return verifiers.get(environment);

  if (environment === Environment.PRODUCTION && APP_APPLE_ID === undefined) {
    throw new Error(
      "APPLE_APP_APPLE_ID が未設定です。本番の購入を検証するには App Store Connect の数値 Apple ID が要ります"
    );
  }

  const verifier = new SignedDataVerifier(
    APPLE_ROOT_CAS,
    ONLINE_CHECKS,
    environment,
    BUNDLE_ID,
    APP_APPLE_ID
  );
  verifiers.set(environment, verifier);
  return verifier;
}

/**
 * 署名を検証せずにペイロードだけ覗く。**戻り値を信用してはいけない。**
 * どちらの Environment 用の verifier を使うかを決めるためだけに使う。
 *
 * ⚠️ Sandbox と Production では署名の鎖が別なので、verifier を取り違えると
 *    正しい JWS でも検証に失敗する。「とりあえず両方試す」と、本物の改竄と
 *    環境の取り違えが同じエラーになって切り分けられなくなる。
 */
function peekEnvironment(jws) {
  const parts = String(jws).split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    // 取引は payload.environment、通知は payload.data.environment に入っている
    const raw = payload?.environment ?? payload?.data?.environment;
    if (raw === "Production") return Environment.PRODUCTION;
    if (raw === "Sandbox") return Environment.SANDBOX;
    return null;
  } catch {
    return null;
  }
}

/**
 * 署名済みトランザクション（JWSTransaction）を検証して中身を返す。
 *
 * 返るのは JWSTransactionDecodedPayload。よく使うのは：
 *   productId / originalTransactionId / transactionId
 *   expiresDate（ミリ秒 epoch）/ environment / revocationDate
 */
export async function verifyTransaction(jws) {
  const environment = peekEnvironment(jws);
  if (environment === null) {
    return { error: "購入情報の形式が不正です" };
  }

  try {
    const payload = await getVerifier(environment).verifyAndDecodeTransaction(jws);
    return { data: payload };
  } catch (e) {
    console.error("[apple] transaction verify failed", e?.status ?? "", e?.message ?? e);
    return { error: "購入情報を検証できませんでした" };
  }
}

/**
 * App Store Server Notifications V2 の signedPayload を検証して中身を返す。
 * 返るのは ResponseBodyV2DecodedPayload（notificationType / subtype / data / notificationUUID）。
 */
export async function verifyNotification(signedPayload) {
  const environment = peekEnvironment(signedPayload);
  if (environment === null) {
    return { error: "通知の形式が不正です" };
  }

  try {
    const payload = await getVerifier(environment).verifyAndDecodeNotification(signedPayload);
    return { data: payload };
  } catch (e) {
    console.error("[apple] notification verify failed", e?.status ?? "", e?.message ?? e);
    return { error: "通知を検証できませんでした" };
  }
}

/** 通知の data.signedTransactionInfo を開く。環境は通知本体と同じものを使う */
export async function verifyTransactionIn(environment, jws) {
  if (!jws) return { error: "取引情報が含まれていません" };
  try {
    const payload = await getVerifier(environment).verifyAndDecodeTransaction(jws);
    return { data: payload };
  } catch (e) {
    console.error("[apple] nested transaction verify failed", e?.message ?? e);
    return { error: "取引情報を検証できませんでした" };
  }
}
