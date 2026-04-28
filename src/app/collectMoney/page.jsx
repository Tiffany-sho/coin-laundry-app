import MoneyDataList from "../feacher/collectMoney/components/coinDataList/CoinDataList";
import { getMyOrganization } from "../api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

const Page = async () => {
  const orgResult = await getMyOrganization();
  const myRole = orgResult.data?.myRole ?? "viewer";
  return <MoneyDataList valiant="manyStore" myRole={myRole} />;
};

export default Page;
