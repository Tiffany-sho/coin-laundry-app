import { getMonthFundsByOffset } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import SalesCardClient from "./SalesCardClient";

const SalesCard = async ({ id }) => {
  const { data, error } = await getMonthFundsByOffset(id, 0);
  return <SalesCardClient id={id} initialData={data ?? null} initialError={error ?? null} />;
};

export default SalesCard;
