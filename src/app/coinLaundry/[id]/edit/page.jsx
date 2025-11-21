import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import CoinLaundryForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm";
import CoinLaundryFormContextProvider from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const updateLaundry = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getStore(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return (
    <CoinLaundryFormContextProvider coinData={data}>
      <CoinLaundryForm storeId={id} images={data.images} method="PUT" />;
    </CoinLaundryFormContextProvider>
  );
};

export default updateLaundry;
