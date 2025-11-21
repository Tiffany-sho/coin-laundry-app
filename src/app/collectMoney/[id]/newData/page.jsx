import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import CollectMoneyForm from "@/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm";
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
    const { data: coinLaundryStore, error } = await supabase
      .from("laundry_store")
      .select("machines,id,store")
      .eq("id", id)
      .eq("owner", user.id)
      .single();

    if (error) {
      console.error(error);
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    if (coinLaundryStore.length === 0) {
      return {
        error: { msg: "店舗が見つかりませんでした", status: 404 },
      };
    }

    return { data: coinLaundryStore };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
    };
  }
}

const Page = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <CollectMoneyForm coinLaundry={data} />;
};

export default Page;
