import dbConnect from "@/lib/dbConnect";
import CoinLaundryStore from "@/models/coinLaundryStore";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { msg: "Unauthorized", result: "failure" },
      { status: 401 }
    );
  }
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
      owner: user.id,
    });
    await newCoinLaundry.save();
    const newId = newCoinLaundry._id;
    return NextResponse.json({ store, id: newId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: "'登録に失敗しました。" }, { status: 500 });
  }
}
