import CoinLaundryClientPage from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getAllLaundryStates } from "../api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getAllMonthBenefits } from "../api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const Page = async () => {
  const [storesResult, statesResult, benefitsResult] = await Promise.all([
    getStores(),
    getAllLaundryStates(),
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
      allStates={statesResult.data ?? []}
      allBenefits={benefitsResult.data ?? []}
    />
  );
};

export default Page;
