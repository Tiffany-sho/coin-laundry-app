import MonoCard from "@/app/feacher/coinLandry/components/MonoCard/MonoCard";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

import { createClient } from "@/utils/supabase/server";

async function getData(id) {
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

    const { data: coinLaundryStore, error } = await supabase
      .from("laundry_store")
      .select("*")
      .eq("id", id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    if (coinLaundryStore.length === 0) {
      return {
        error: { msg: "店舗が見つかりませんでした", status: 404 },
      };
    }

    return { data: coinLaundryStore[0] };
  } catch (err) {
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
