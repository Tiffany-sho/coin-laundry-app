import CoinLaundryClientPage from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getAllMonthBenefits } from "../api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const CoinLaundryData = async () => {
  const [storesResult, benefitsResult] = await Promise.all([
    getStores(),
    getAllMonthBenefits(),
  ]);

  if (storesResult.error)
    return (
      <ErrorPage
        title={storesResult.error.msg}
        status={storesResult.error.status}
      />
    );

  return (
    <CoinLaundryClientPage
      stores={storesResult.data}
      allBenefits={benefitsResult.data ?? []}
    />
  );
};

export default CoinLaundryData;
