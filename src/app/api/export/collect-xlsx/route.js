import { NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { buildSheets, buildSheetsWithExpenses } from "@/functions/xlsxExport";
import { fetchExportExpenses } from "@/functions/exportExpenses";

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

  const { startEpoch, endEpoch, storeIds, splitMethod, includeExpenses } =
    await request.json();

  /*
    ⚠️ **知らない値は "period" に倒す（エラーにしない）。** 古い画面が新しい値を
       送ってきたときに書き出しごと失敗させないため。
    ⚠️ `"none"` は「1 シートにまとめる」。1 店舗ぶんを `"store"` で代用しないこと
       （改名した店舗が 1 店舗なのに 2 シートに割れる）。
  */
  const split = ["period", "store", "none"].includes(splitMethod) ? splitMethod : "period";

  const { data, error } = await getCollectFundsForExport(
    startEpoch ?? null,
    endEpoch ?? null,
    storeIds ?? null
  );
  if (error) return NextResponse.json({ error }, { status: 400 });

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ダウンロードするデータがありません" }, { status: 404 });
  }

  let sheets;
  if (includeExpenses === true) {
    const result = await fetchExportExpenses(
      startEpoch ?? null,
      endEpoch ?? null,
      Array.isArray(storeIds) && storeIds.length > 0 ? storeIds : null
    );
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    sheets = buildSheetsWithExpenses(data, result.expenses, { splitMethod: split });
  } else {
    sheets = buildSheets(data, { splitMethod: split });
  }

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
