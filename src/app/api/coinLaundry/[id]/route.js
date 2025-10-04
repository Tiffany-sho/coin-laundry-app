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
    console.log(editCoinLaundry);
    await editCoinLaundry.save();
    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ msg: "'登録に失敗しました。" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  dbConnect();

  const formData = await request.formData();
  const store = formData.get("store");

  try {
    const { id } = await params;
    await CoinLaundryStore.findByIdAndDelete(id);
    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ msg: "'登録に失敗しました。" }, { status: 500 });
  }
}
