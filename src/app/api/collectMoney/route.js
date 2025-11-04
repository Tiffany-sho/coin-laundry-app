import CollectMoney from "@/models/collectMoney";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const collectmoneyData = await CollectMoney.find({});
    if (!collectmoneyData) {
      return NextResponse.json(
        { msg: "集金データが見つかりませんでした", result: "failure" },
        { status: 404 }
      );
    }
    return NextResponse.json(collectmoneyData);
  } catch (err) {
    return NextResponse.json(
      { msg: "予期しないエラーが発生しました", result: "failure" },
      { status: 400 }
    );
  }
}
