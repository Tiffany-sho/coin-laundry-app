import { withAuth, corsPreflight } from "../../../_lib/handler";
import { getStoreMachineBreakdown } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

export const dynamic = "force-dynamic";

/**
 * 機器ごとの売上内訳。店舗別ページの「機器別」タブが使う。
 *
 *   GET /api/v1/funds/summary/machines?storeId=<uuid>&from=<epoch>&to=<epoch>
 *   → { machines: [{ id, name, total }],
 *       unattributed: { totalMode, other },
 *       total }
 *
 * ⚠️ **machines の和 + unattributed の和 は total と必ず一致する。**
 *    合計入力モード（fundsArray が空）と、totalFunds と fundsArray のずれを
 *    どちらも捨てずに `unattributed` へ逃がしているため。
 *
 * ⚠️ **to は排他**（`lt`）。/funds/chart と同じ規約なので、その月を含めたいときは
 *    翌月 1 日を渡すこと。書き出し（`/funds/export`）だけ `lte` で**向きが逆**なので
 *    混同しないこと。
 *
 * ⚠️ **storeId は必須。** 組織全体の機器別内訳は出さない。店舗をまたぐと
 *    同じ名前（「洗濯機1」）の別の台が合算されて、意味の無い数字になる。
 *
 * ⚠️ **集計はサーバで畳んでから返す。** fundsArray を端末へ流さないこと
 *    （5 年 × 十数台で応答が数 MB になる）。
 */
export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!storeId) return { error: "店舗を指定してください", status: 400 };

  // ⚠️ Number(null) は 0 になって isFinite を通る。有無を先に見ないと
  //    未指定が「0 〜 0」の空区間として通ってしまう（/funds/chart と同じ）
  if (from === null || to === null) {
    return { error: "期間の指定が不正です", status: 400 };
  }

  const startEpoch = Number(from);
  const endEpoch = Number(to);

  if (!Number.isFinite(startEpoch) || !Number.isFinite(endEpoch)) {
    return { error: "期間の指定が不正です", status: 400 };
  }
  if (endEpoch <= startEpoch) {
    return { error: "終了日は開始日より後にしてください", status: 400 };
  }

  return await getStoreMachineBreakdown(storeId, startEpoch, endEpoch);
});

export const OPTIONS = corsPreflight;
