import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getFundItemById,
  updateData,
  updateDate,
  deleteData,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

/** 明細（fundsArray）の遅延取得。一覧では返していないので詳細を開いたときに叩く */
export const GET = withAuth(async (request, context) => {
  const { id } = await context.params;
  return await getFundItemById(id);
});

/**
 * 更新。body に fundsArray/totalFunds があれば金額の更新、date があれば集金日の更新。
 * 「admin 以外は自分の集金データのみ」という規則は updateData / updateDate 側が持っている。
 */
export const PATCH = withAuth(async (request, context) => {
  const { id } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  if (body?.date !== undefined) {
    if (!Number.isFinite(body.date)) return { error: "集金日が不正です", status: 400 };
    return await updateDate(body.date, id);
  }

  if (body?.totalFunds !== undefined) {
    if (!Number.isFinite(body.totalFunds) || body.totalFunds < 0) {
      return { error: "合計金額が不正です", status: 400 };
    }
    if (body.fundsArray != null && !Array.isArray(body.fundsArray)) {
      return { error: "明細の形式が不正です", status: 400 };
    }
    return await updateData(body.fundsArray ?? [], body.totalFunds, id);
  }

  return { error: "更新する内容がありません", status: 400 };
});

export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  return await deleteData(id);
});

export const OPTIONS = corsPreflight;
