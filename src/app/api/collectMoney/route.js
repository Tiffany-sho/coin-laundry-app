import CollectMoney from "@/models/collectMoney";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const collectmoneyData = await CollectMoney.find({});
    return NextResponse.json(collectmoneyData);
  } catch (err) {
    return NextResponse.json(
      { message: "予期しないエラーが発生しました" },
      { status: 400 }
    );
  }
}
