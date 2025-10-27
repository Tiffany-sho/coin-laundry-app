import CollectMoney from "@/models/collectMoney";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    console.log(id);
    const collectMoney = await CollectMoney.findById(id);
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
  if (machineMoney === null) {
    return NextResponse.json(
      { msg: "入力フィールドが空のものがあります。" },
      { status: 500 }
    );
  }
  try {
    const { id } = await params;
    const collectMoney = await CollectMoney.findById(id);

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
