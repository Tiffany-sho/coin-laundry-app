import { getStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import CollectMoneyForm from "@/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm";

export const dynamic = "force-dynamic";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

/**
 * ⚠️ **`scope` は URL から受け取る**（2026-08-05）。何を集金するかは
 *    `CollectStartButton` が先に聞いてから付けてくる。
 * ⚠️ **未指定は「両方」**（`normalizeScope`）。ブックマークや古いリンクから
 *    開かれたときに、入力欄が黙って消えている状態にしないため。
 */
const Page = async ({ params, searchParams }) => {
  const { id } = await params;
  const { scope } = (await searchParams) ?? {};
  const [{ data, error }, { data: orgData }] = await Promise.all([
    getStore(id),
    getMyOrganization(),
  ]);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  if (!orgData || orgData.myRole === "viewer") {
    return <ErrorPage title="集金登録の権限がありません" status={403} />;
  }
  return <CollectMoneyForm coinLaundry={data} scope={scope} />;
};

export default Page;
