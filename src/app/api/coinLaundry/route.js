import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const coinLaundryStores = await CoinLaundryStore.find({});
    return NextResponse.json({ success: true, data: coinLaundryStores });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 400 }
    );
  }
}
