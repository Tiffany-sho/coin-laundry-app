import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import MoneyDataList from "@/app/feacher/collectMoney/components/coinDataList/CoinDataList";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const Page = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getStore(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <MoneyDataList valiant="aStore" coinLaundry={data} />;
};

export default Page;
