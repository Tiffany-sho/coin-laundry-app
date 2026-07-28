import { withAuth, corsPreflight } from "../../_lib/handler";
import { getOrganizationMembers } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

/**
 * メンバー一覧。
 * ⚠️ getOrganizationMembers は { data, orgId, myRole } と data の外にも値を返すので、
 *    そのまま通すと orgId / myRole が落ちる。data に畳んで返す。
 */
export const GET = withAuth(async () => {
  const result = await getOrganizationMembers();
  if (result.error) return result;
  return {
    data: { members: result.data ?? [], orgId: result.orgId, myRole: result.myRole },
  };
});

export const OPTIONS = corsPreflight;
