import MoneyDataList from "../feacher/collectMoney/components/coinDataList/CoinDataList";
import { getMyOrganization, getOrgPlan } from "../api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

const Page = async () => {
  const [orgResult, { data: planInfo }] = await Promise.all([
    getMyOrganization(),
    getOrgPlan(),
  ]);
  const myRole = orgResult.data?.myRole ?? "viewer";
  const plan = planInfo?.plan ?? "free";
  return <MoneyDataList valiant="manyStore" myRole={myRole} plan={plan} />;
};

export default Page;
