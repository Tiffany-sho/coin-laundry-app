import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const coinLaundryStore = await CoinLaundryStore.findById(id);

    if (!coinLaundryStore) {
      return NextResponse.json(
        { success: false, message: "店舗が見つかりませんでした" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: coinLaundryStore });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "エラーが発生しました" },
      { status: 400 }
    );
  }
}
