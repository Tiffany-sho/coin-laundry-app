import { NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { buildSheets } from "@/functions/xlsxExport";

export async function POST(request) {
  const { data: planInfo, error: planError } = await getOrgPlan();
  if (planError || !planInfo) {
    return NextResponse.json({ error: "プラン情報を取得できませんでした" }, { status: 401 });
  }
  if (planInfo.plan === "free") {
    return NextResponse.json(
      { error: "Excelエクスポートは Pro プラン以上でご利用いただけます" },
      { status: 403 }
    );
  }

  const { startEpoch, endEpoch, storeIds, splitMethod } = await request.json();

  const { data, error } = await getCollectFundsForExport(
    startEpoch ?? null,
    endEpoch ?? null,
    storeIds ?? null
  );
  if (error) return NextResponse.json({ error }, { status: 400 });

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ダウンロードするデータがありません" }, { status: 404 });
  }

  const sheets = buildSheets(data, {
    splitMethod: splitMethod === "store" ? "store" : "period",
  });

  const buffer = await writeXlsxFile(sheets).toBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
