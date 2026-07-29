import { withAuth, corsPreflight, errorResponse } from "../_lib/handler";
import {
  createData,
  getStoreFundsPaginated,
  getOrgCollectFundsPaginated,
  getStoreFundsInPeriod,
  getOrgCollectFundsInPeriod,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/**
 * 集金データの一覧。
 *   storeId あり → その店舗のみ / なし → 組織全体
 *   from,to あり → 期間指定 / なし → offset+limit のページネーション
 */
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);

  const storeId = searchParams.get("storeId");
  const order = searchParams.get("order") ?? "date";
  const asc = searchParams.get("asc") === "true";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  /**
   * 期間指定。to は省略できる（＝開始日以降すべて）。
   *
   * ⚠️ アプリの売上履歴はこちらを使うこと。下の offset+limit の経路は
   *    getOrgCollectFundsPaginated が startEpoch を「2 か月前の月初」に固定しており、
   *    offset をいくら進めても**それより古いデータは絶対に返らない**。
   *    並び替えも DB の ORDER BY で効くので、読み込み済みのページ内だけを
   *    並べ替えて「売上が高い順」が嘘になる問題も起きない。
   */
  if (from !== null) {
    const startEpoch = Number(from);
    const endEpoch = to === null ? null : Number(to);
    if (!Number.isFinite(startEpoch)) {
      return { error: "期間の指定が不正です", status: 400 };
    }
    if (endEpoch !== null && !Number.isFinite(endEpoch)) {
      return { error: "期間の指定が不正です", status: 400 };
    }
    return storeId
      ? await getStoreFundsInPeriod(storeId, startEpoch, endEpoch, order, asc)
      : await getOrgCollectFundsInPeriod(startEpoch, endEpoch, order, asc);
  }

  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(MAX_LIMIT, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT);
  // Supabase の range は両端を含むので to は offset+limit-1
  const rangeTo = offset + limit - 1;

  return storeId
    ? await getStoreFundsPaginated(storeId, order, asc, offset, rangeTo)
    : await getOrgCollectFundsPaginated(order, asc, offset, rangeTo);
});

/**
 * 集金データの登録。
 *
 * Idempotency-Key を必須にする。オフライン送信キューは応答を受け取れなかった場合に
 * 必ず再送するため、キーがないと二重計上が起きる（設計図 6.4 / R2）。
 */
export const POST = withAuth(async (request) => {
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return { error: "Idempotency-Key ヘッダが必要です", status: 400 };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const { storeId, store, date, fundsArray, totalFunds } = body ?? {};

  if (!storeId || !store) return { error: "店舗が指定されていません", status: 400 };
  if (!Number.isFinite(date)) return { error: "集金日が不正です", status: 400 };
  if (!Number.isFinite(totalFunds) || totalFunds < 0) {
    return { error: "合計金額が不正です", status: 400 };
  }
  if (fundsArray != null && !Array.isArray(fundsArray)) {
    return { error: "明細の形式が不正です", status: 400 };
  }

  const result = await createData({
    storeId,
    store,
    date,
    fundsArray: fundsArray ?? [],
    totalFunds,
    clientRequestId: idempotencyKey,
  });

  if (result.error) return result;

  // 再送で既存レコードを返した場合も 200。アプリは Outbox から破棄してよい
  return { data: { ...result.data, duplicated: Boolean(result.duplicated) } };
});

export const OPTIONS = corsPreflight;
