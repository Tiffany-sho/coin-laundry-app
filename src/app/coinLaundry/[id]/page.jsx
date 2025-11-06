import MonoCard from "@/app/feacher/coinLandry/components/MonoCard/MonoCard";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

import CoinLaundryStore from "@/models/coinLaundryStore";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { createClient } from "@/utils/supabase/server";

async function getData(id) {
  await dbConnect();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    if (!user) {
      return {
        error: { msg: "Unauthorized", status: 401 },
      };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        error: {
          msg: "IDの形式が正しくありません。",
          status: 400,
        },
      };
    }
    const coinLaundryStore = await CoinLaundryStore.findById(id);

    if (
      !coinLaundryStore ||
      coinLaundryStore.length === 0 ||
      coinLaundryStore.owner !== user.id
    ) {
      return {
        error: {
          msg: "店舗が見つかりませんでした",
          status: 404,
        },
      };
    }

    return { data: JSON.parse(JSON.stringify(coinLaundryStore)) };
  } catch (err) {
    console.error(err);
    return {
      error: { msg: "予期しないエラー", status: 400 },
    };
  }
}

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  return <MonoCard coinLaundry={data} />;
};

export default CoinLaundry;
