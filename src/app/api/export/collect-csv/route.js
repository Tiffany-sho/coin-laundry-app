import { NextResponse } from "next/server";
import { getCollectFundsForExport } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const EPOCH_OFFSET = 32400000;

function epochToDateStr(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function buildFilename() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `collecie_${y}${m}${d}.csv`;
}

export async function POST(request) {
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
