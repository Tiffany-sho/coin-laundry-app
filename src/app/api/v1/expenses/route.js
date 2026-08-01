import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getExpenses,
  createExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * 経費の一覧。**毎月の固定費を展開したものも混ざって返る。**
 *
 *   GET /api/v1/expenses?from=<epoch>&to=<epoch>&storeId=<uuid>
 *
 * ⚠️ **`to` は「含む」（`lte`）。** /funds/chart の `to` は排他なので**向きが逆**。
 *    書き出し（/funds/export）と同じ規約。「その月まで」を出したいときは
 *    翌月 1 日ではなく**その 1 ミリ秒前**を渡すこと。
 *
 * ⚠️ **期間は必須。** 経費は増え続けるので、切らないと PostgREST の
 *    1000 行上限で古い順から黙って欠ける。
 *
 * ⚠️ 展開された固定費は `recurring: true` で、`id` は実在しない
 *    （`recurring:<定義id>:<YYYY-MM>`）。**PATCH / DELETE には使えない。**
 */
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // ⚠️ Number(null) は 0 になって isFinite を通る。有無を先に見る
  if (from === null || to === null) {
    return { error: "期間の指定が不正です", status: 400 };
  }

  const startEpoch = Number(from);
  const endEpoch = Number(to);
  if (!Number.isFinite(startEpoch) || !Number.isFinite(endEpoch)) {
    return { error: "期間の指定が不正です", status: 400 };
  }
  if (endEpoch < startEpoch) {
    return { error: "終了日は開始日以降にしてください", status: 400 };
  }

  return await getExpenses(startEpoch, endEpoch, searchParams.get("storeId"));
});

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await createExpense({
    laundryId: body?.storeId ?? null,
    date: body?.date,
    amount: body?.amount,
    category: body?.category,
    note: body?.note ?? null,
  });
  if (result.error) return result;

  /*
    組織のデータを変える操作なので記録する。
    ⚠️ **メモ（note）は書かない。** 自由入力で、ログは組織の全員が読む。
  */
  await logAction(`経費を登録しました（${result.data.category}）`);
  return result;
});

export const OPTIONS = corsPreflight;
