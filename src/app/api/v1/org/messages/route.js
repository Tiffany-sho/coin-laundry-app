import { withAuth, corsPreflight } from "../../_lib/handler";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { getOrgMessages } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

// 操作ログ。orgId は getMyOrganization から引く（アプリに渡させない）
export const GET = withAuth(async () => {
  const org = await getMyOrganization();
  if (org.error) return org;
  return await getOrgMessages(org.data.id);
});

export const OPTIONS = corsPreflight;
