import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import CollectMoneyForm from "@/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const Page = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getStore(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  return <CollectMoneyForm coinLaundry={data} />;
};

export default Page;
