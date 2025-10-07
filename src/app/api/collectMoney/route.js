import CollectMoney from "@/models/collectMoney";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const data = await request.json();

  for (let ele of data.moneyArray) {
    if (!ele.money) {
      console.log(ele.money);
      return NextResponse.json(
        { msg: "入力フィールドが空のものがあります。" },
        { status: 500 }
      );
    }
  }

  try {
    const newCollectMoney = new CollectMoney(data);
    await newCollectMoney.save();
    return NextResponse.json({ store: data.store });
  } catch {
    return NextResponse.json({ msg: "登録に失敗しました。" }, { status: 500 });
  }
}
