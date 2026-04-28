import CoinLaundryClientPage from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getAllMonthBenefits } from "../api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { getMyOrganization } from "../api/supabaseFunctions/supabaseDatabase/organization/action";

const CoinLaundryData = async () => {
  const [storesResult, benefitsResult, orgResult] = await Promise.all([
    getStores(),
    getAllMonthBenefits(),
    getMyOrganization(),
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
      myRole={orgResult.data?.myRole ?? "viewer"}
    />
  );
};

export default CoinLaundryData;
