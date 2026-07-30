import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getFundItemById,
  updateData,
  updateDate,
  deleteData,
} from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * ログに出す店舗名を、**操作の前に** DB から引いておく。
 *
 * ⚠️ 削除では消えたあとに引けないので必ず先に取る。
 * ⚠️ 引けなくても操作は止めない（ログのための取得で本体を失敗させない）。
 */
async function fundStoreName(id) {
  try {
    const item = await getFundItemById(id);
    return item?.data?.laundryName ?? null;
  } catch {
    return null;
  }
}

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
    const storeName = await fundStoreName(id);
    const result = await updateDate(body.date, id);
    if (!result?.error) await logAction(`${storeName ?? "店舗"}店の集金日を変更しました`);
    return result;
  }

  if (body?.totalFunds !== undefined) {
    if (!Number.isFinite(body.totalFunds) || body.totalFunds < 0) {
      return { error: "合計金額が不正です", status: 400 };
    }
    if (body.fundsArray != null && !Array.isArray(body.fundsArray)) {
      return { error: "明細の形式が不正です", status: 400 };
    }
    const storeName = await fundStoreName(id);
    const result = await updateData(body.fundsArray ?? [], body.totalFunds, id);
    /**
     * ⚠️ **`changed` を見る。** 非 admin が他人の集金データを編集すると
     *    0 行更新の 200 が返るので（docs/contracts.md）、error だけを見ると
     *    **実際には起きていない編集がログに残る。**
     */
    if (!result?.error && result?.changed > 0) {
      await logAction(`${storeName ?? "店舗"}店の集金データを編集しました`);
    }
    return result;
  }

  return { error: "更新する内容がありません", status: 400 };
});

export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  // ⚠️ 消える前に名前を取る
  const storeName = await fundStoreName(id);
  const result = await deleteData(id);
  // ⚠️ 削除も 0 行で成功扱いになりうる（PATCH と同じ理由）
  if (!result?.error && result?.changed > 0) {
    await logAction(`${storeName ?? "店舗"}店の集金データを削除しました`);
  }
  return result;
});

export const OPTIONS = corsPreflight;
