import { NextResponse } from "next/server";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { fetchExportExpenses } from "@/functions/exportExpenses";
import { recordsToCsv, recordsToCsvWithExpenses } from "@/functions/csvExport";

export async function POST(request) {
  const { data: planInfo, error: planError } = await getOrgPlan();
  if (planError || !planInfo) {
    return NextResponse.json({ error: "プラン情報を取得できませんでした" }, { status: 401 });
  }
  if (planInfo.plan === "free") {
    return NextResponse.json(
      { error: "CSVエクスポートはProプラン以上でご利用いただけます" },
      { status: 403 }
    );
  }

  const { startEpoch, endEpoch, storeIds, includeExpenses } = await request.json();

  const { data, error } = await getCollectFundsForExport(
    startEpoch ?? null,
    endEpoch ?? null,
    storeIds ?? null
  );
  if (error) return NextResponse.json({ error }, { status: 400 });

  /*
    経費を足さないときは**行をそのまま返す**（従来どおり）。ブラウザ側で
    `buildCsvFiles` が月ごと・店舗ごとに分けて連続ダウンロードするため。

    ⚠️ **経費を足すときはサーバで 1 本の CSV に組む。** 経費と月別利益は
       集金の表と**行の意味も列の数も違う**ので、分割したファイルそれぞれに
       混ぜると意味を成さない（アプリの `/api/v1/funds/export` と同じ判断）。
       返す形が変わるので、受け取る側は `csv` の有無で分けること。
  */
  if (includeExpenses === true) {
    const result = await fetchExportExpenses(
      startEpoch ?? null,
      endEpoch ?? null,
      Array.isArray(storeIds) && storeIds.length > 0 ? storeIds : null
    );
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({
      csv: recordsToCsvWithExpenses(data ?? [], result.expenses),
      recordCount: (data ?? []).length,
      /* ⚠️ 0 と null を区別する。0 =「含めたが 1 件も無かった」、
            null =「含めていない」。まとめると、選んだのに 0 件だったときに
            失敗したのか本当に無いのか分からなくなる */
      expenseCount: result.expenses.length,
    });
  }

  return NextResponse.json({ data });
}
