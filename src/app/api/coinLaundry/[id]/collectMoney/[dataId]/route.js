import CollectMoney from "@/models/collectMoney";
import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { dataId } = await params;
    console.log(dataId);
    const collectMoney = await CollectMoney.findById(dataId);
    return NextResponse.json({ collectMoney });
  } catch {
    return NextResponse.json(
      { msg: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(requset, { params }) {
  await dbConnect();

  const editData = await requset.json();
  const machineId = editData.id;
  const machineMoney = editData.money;
  console.log(machineMoney);
  if (machineMoney === null) {
    return NextResponse.json(
      { msg: "入力フィールドが空のものがあります。" },
      { status: 500 }
    );
  }
  try {
    const { dataId } = await params;
    const collectMoney = await CollectMoney.findById(dataId);

    if (!collectMoney) {
      return NextResponse.json(
        { msg: "データが見つかりません" },
        { status: 500 }
      );
    }

    const editMachine = collectMoney.moneyArray.find(
      (item) => item.id === machineId
    );

    if (!editMachine) {
      return NextResponse.json(
        { msg: "データが見つかりません" },
        { status: 500 }
      );
    }

    editMachine.money = machineMoney;

    await collectMoney.save();

    const store = collectMoney.store;
    const machine = editMachine.machine.name;

    return NextResponse.json({ store, machine });
  } catch {
    return NextResponse.json({ msg: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id, dataId } = await params;
    const collectMoney = await CollectMoney.findByIdAndDelete(dataId);
    await CoinLaundryStore.findByIdAndUpdate(id, {
      $pull: { moneyData: dataId },
    });

    const store = collectMoney.store;
    const date = collectMoney.date;
    console.log(date);
    return NextResponse.json({ store, id, date });
  } catch {
    return NextResponse.json({ msg: "削除に失敗しました" }, { status: 500 });
  }
}
