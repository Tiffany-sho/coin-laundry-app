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
  /* ⚠️ 未指定＝使う。`!== false` で読む（012 より前の行は列を持たない） */
  const expensesEnabled = orgResult.data?.expensesEnabled !== false;
  return (
    <MoneyDataList
      valiant="manyStore"
      myRole={myRole}
      plan={plan}
      expensesEnabled={expensesEnabled}
    />
  );
};

export default Page;
