import CoinLaundryForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm/CoinLaundryForm";
import CoinLaundryFormContextProvider from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
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

    return { data: coinLaundryStore[0] };
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
