import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getRecurringExpenses,
  createRecurringExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

/**
 * 毎月の固定費（家賃・水道光熱費など）の**定義**。
 *
 * ⚠️ **実体の経費レコードは作らない。** 一覧（GET /api/v1/expenses）が
 *    期間内の各月へ展開して返す。したがって
 *    **金額を変えると過去の月まで遡って変わる。**「今月から上がった」を
 *    表したいときは、既存の定義に `endMonth` を入れて終わらせ、新しい定義を作る。
 *
 * ⚠️ **静的ルートなので `expenses/[id]` より優先される**（`funds/chart` と同じ）。
 *    ただし**本番に出るまでは `[id]` に吸われて 405 が返る**。405 の body は空なので
 *    アプリには既定の「エラーが発生しました」しか出ず、未デプロイだと気づけない。
 *    疑ったら本番を直接叩くこと（401 ならデプロイ済み）。
 */
export const GET = withAuth(async () => await getRecurringExpenses());

export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  const result = await createRecurringExpense({
    laundryId: body?.storeId ?? null,
    name: body?.name,
    amount: body?.amount,
    category: body?.category,
    dayOfMonth: body?.dayOfMonth,
    startMonth: body?.startMonth,
    endMonth: body?.endMonth ?? null,
  });
  if (result.error) return result;

  await logAction(`毎月の固定費「${result.data.name}」を追加しました`);
  return result;
});

export const OPTIONS = corsPreflight;
