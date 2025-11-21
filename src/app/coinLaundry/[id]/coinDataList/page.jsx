import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import MoneyDataList from "@/app/feacher/collectMoney/components/coinDataList/CoinDataList";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { createClient } from "@/utils/supabase/server";

async function getData(id) {
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
      .eq("laundryId", id)
      .eq("collecter", user.id);

    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 401 },
      };
    }

    return { data: data[0] };
  } catch (error) {
    if (error) {
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }
  }
}

const Page = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <MoneyDataList valiant="aStore" laundryInfo={data} />;
};

export default Page;
