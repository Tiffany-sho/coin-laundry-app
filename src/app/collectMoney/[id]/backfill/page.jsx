import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import BackfillForm from "@/app/feacher/collectMoney/components/backfill/BackfillForm";

export const dynamic = "force-dynamic";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

/**
 * 過去の集金データの一括入力。
 *
 * ⚠️ **ガードは `newData/page.jsx`（集金登録）と同じにすること。** 入れるのは集金
 *    データそのもので、権限の条件も同じ:
 *      - `getStore(id)` が担当店舗（011）の外と他組織を弾く
 *      - viewer は登録できない
 *    ⚠️ 画面を通っても最後の砦は `createData` の側（role と `getOrgStoreIds()` を
 *       自分で見る）。**こちらのガードを理由にあちらを省かないこと。**
 */
const Page = async ({ params }) => {
  const { id } = await params;
  const [{ data, error }, { data: orgData }] = await Promise.all([
    getStore(id),
    getMyOrganization(),
  ]);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  if (!orgData || orgData.myRole === "viewer") {
    return <ErrorPage title="集金登録の権限がありません" status={403} />;
  }
  return <BackfillForm coinLaundry={data} />;
};

export default Page;
