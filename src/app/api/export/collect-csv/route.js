import { NextResponse } from "next/server";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

const EPOCH_OFFSET = 32400000;

function epochToDateStr(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
}

function buildFilename() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `collecie_${y}${m}${d}.csv`;
}

export async function POST(request) {
  const { data: planInfo, error: planError } = await getOrgPlan();
  if (planError || !planInfo) {
    return NextResponse.json({ error: "プラン情報を取得できませんでした" }, { status: 401 });
  }
  if (planInfo.plan === "free") {
    return NextResponse.json({ error: "CSVエクスポートはProプラン以上でご利用いただけます" }, { status: 403 });
  }

  const { startEpoch, endEpoch } = await request.json();

  const { data, error } = await getCollectFundsForExport(startEpoch, endEpoch ?? null);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const BOM = "﻿";
  const header = "日付,店舗名,合計金額,担当者\n";
  const rows = data
    .map((row) => {
      const date = epochToDateStr(row.date);
      const store = `${row.laundryName}店`;
      const amount = row.totalFunds ?? 0;
      const collector = row.profiles?.username ?? "";
      return `${date},${store},${amount},${collector}`;
    })
    .join("\n");

  const csv = BOM + header + rows;
  const filename = buildFilename();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
