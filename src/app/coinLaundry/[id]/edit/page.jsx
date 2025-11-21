import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import CoinLaundryForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm";
import CoinLaundryFormContextProvider from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
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
      .select("*")
      .eq("id", id)
      .eq("owner", user.id)
      .single();

    if (error) {
      console.error(error);
      return {
        error: { msg: "データの取得に失敗しました", status: 500 },
      };
    }

    return { data: coinLaundryStore };
  } catch (err) {
    return {
      error: { msg: "予期しないエラー", status: 400 },
    };
  }
}
const updateLaundry = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return (
    <CoinLaundryFormContextProvider coinData={data}>
      <CoinLaundryForm storeId={id} images={data.images} method="PUT" />;
    </CoinLaundryFormContextProvider>
  );
};

export default updateLaundry;
