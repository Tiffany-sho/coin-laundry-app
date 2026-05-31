import { NextResponse } from "next/server";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

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

  const { startEpoch, endEpoch, storeIds } = await request.json();

  const { data, error } = await getCollectFundsForExport(
    startEpoch ?? null,
    endEpoch ?? null,
    storeIds ?? null
  );
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ data });
}
