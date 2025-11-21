import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import MonoCard from "@/app/feacher/coinLandry/components/MonoCoinLaundry/ImageCarusel/MonoCard";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getStore(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  return <MonoCard coinLaundry={data} />;
};

export default CoinLaundry;
