import ErrorPage from "../feacher/jumpPage/ErrorPage/ErrorPage";
import { createClient } from "@/utils/supabase/server";
import MoneyDataList from "../feacher/collectMoney/components/coinDataList/CoinDataList";
import { getUser } from "../api/supabaseFunctions/supabaseDatabase/user/action";

async function getData() {
  const { user } = await getUser();
  if (!user) {
    return {
      error: { msg: "Unauthorized", status: 401 },
    };
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("collect_funds")
      .select("laundryName,laundryId")
      .eq("collecter", user.id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 401 },
      };
    }

    return { data: data };
  } catch (error) {
    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }
  }
}

const Page = async () => {
  const { data, error } = await getData();
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <MoneyDataList valiant="manyStore" laundryInfo={data} />;
};

export default Page;
