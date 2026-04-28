import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import MoneyDataList from "@/app/feacher/collectMoney/components/coinDataList/CoinDataList";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const Page = async ({ params }) => {
  const { id } = await params;
  const [{ data, error }, orgResult] = await Promise.all([
    getStore(id),
    getMyOrganization(),
  ]);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return (
    <MoneyDataList
      valiant="aStore"
      coinLaundry={data}
      myRole={orgResult.data?.myRole ?? "viewer"}
    />
  );
};

export default Page;
