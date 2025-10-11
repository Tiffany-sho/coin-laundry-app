import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { msg: "IDの形式が正しくありません。" },
        { status: 400 }
      );
    }

    const coinLaundryStore = await CoinLaundryStore.findById(id);

    if (!coinLaundryStore) {
      console.log("not found");
      return NextResponse.json(
        { msg: "店舗が見つかりませんでした" },
        { status: 404 }
      );
    }

    return NextResponse.json(coinLaundryStore);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  await dbConnect();

  const formData = await request.formData();
  const store = formData.get("store");
  const location = formData.get("location");
  const description = formData.get("description");
  const machines = JSON.parse(formData.get("machines"));

  if (store === "" || location === "" || description === "") {
    return NextResponse.json(
      { msg: "入力フィールドが空のものがあります。" },
      { status: 500 }
    );
  }
  try {
    const { id } = await params;

    const editCoinLaundry = await CoinLaundryStore.findByIdAndUpdate(id, {
      store,
      location,
      description,
      machines,
    });
    await editCoinLaundry.save();
    return NextResponse.json({ store, id });
  } catch {
    return NextResponse.json({ msg: "'登録に失敗しました。" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  dbConnect();

  try {
    const { id } = await params;
    const deleteCoinLaundry = await CoinLaundryStore.findByIdAndDelete(id);
    const store = deleteCoinLaundry.store;
    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ msg: "削除に失敗しました。" }, { status: 500 });
  }
}
