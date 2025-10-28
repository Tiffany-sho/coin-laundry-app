import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const coinLaundryStores = await CoinLaundryStore.find({});
    if (!coinLaundryStores) {
      return NextResponse.json(
        { msg: "店舗が見つかりませんでした", result: "failure" },
        { status: 404 }
      );
    }
    return NextResponse.json(coinLaundryStores);
  } catch (err) {
    return NextResponse.json(
      { msg: "予期しないエラーが発生しました", result: "failure" },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  await dbConnect();

  const formData = await request.formData();
  const store = formData.get("store");
  const location = formData.get("location");
  const description = formData.get("description");
  const machines = JSON.parse(formData.get("machines"));
  const images = JSON.parse(formData.get("images"));

  if (store === "" || location === "" || description === "") {
    return NextResponse.json(
      { msg: "入力フィールドが空のものがあります。" },
      { status: 500 }
    );
  }
  try {
    const newCoinLaundry = new CoinLaundryStore({
      store,
      location,
      description,
      machines,
      images,
    });
    await newCoinLaundry.save();
    const newId = newCoinLaundry._id;
    return NextResponse.json({ store, id: newId });
  } catch {
    return NextResponse.json({ msg: "'登録に失敗しました。" }, { status: 500 });
  }
}
