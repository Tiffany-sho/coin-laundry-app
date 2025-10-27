import CollectMoney from "@/models/collectMoney";
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
        { msg: "IDの形式が正しくありません。", result: "failure" },
        { status: 400 }
      );
    }

    const coinLaundryStore = await CoinLaundryStore.findById(id).populate(
      "moneyData"
    );

    if (!coinLaundryStore) {
      return NextResponse.json(
        { msg: "店舗が見つかりませんでした", result: "failure" },
        { status: 404 }
      );
    }
    if (coinLaundryStore.moneyData.length === 0) {
      return NextResponse.json(
        { msg: "集金データが見つかりませんでした", result: "failure" },
        { status: 404 }
      );
    }
    return NextResponse.json(coinLaundryStore.moneyData);
  } catch (err) {
    return NextResponse.json(
      { msg: "予期しないエラーが発生しました", result: "failure" },
      { status: 400 }
    );
  }
}

export async function POST(request, { params }) {
  await dbConnect();
  const data = await request.json();

  for (let ele of data.moneyArray) {
    if (!ele.money) {
      return NextResponse.json(
        { msg: "入力フィールドが空のものがあります。" },
        { status: 500 }
      );
    }
  }
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
      return NextResponse.json(
        { msg: "店舗が見つかりませんでした" },
        { status: 404 }
      );
    }

    const newCollectMoney = new CollectMoney(data);
    coinLaundryStore.moneyData.push(newCollectMoney);
    await newCollectMoney.save();
    await coinLaundryStore.save();

    const store = coinLaundryStore.store;

    return NextResponse.json({ store });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { msg: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
