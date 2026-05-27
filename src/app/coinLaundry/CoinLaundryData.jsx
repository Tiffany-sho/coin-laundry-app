import CoinLaundryClientPage from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization, getOrgPlan } from "../api/supabaseFunctions/supabaseDatabase/organization/action";

const CoinLaundryData = async () => {
  const [storesResult, orgResult, planResult] = await Promise.all([
    getStores(),
    getMyOrganization(),
    getOrgPlan(),
  ]);

  if (storesResult.error)
    return (
      <ErrorPage
        title={storesResult.error.msg}
        status={storesResult.error.status}
      />
    );

  const planInfo = planResult.data ?? null;

  return (
    <CoinLaundryClientPage
      stores={storesResult.data}
      myRole={orgResult.data?.myRole ?? "viewer"}
      planInfo={planInfo}
    />
  );
};

export default CoinLaundryData;
