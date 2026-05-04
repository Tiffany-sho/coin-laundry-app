import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";
import Log from "@/app/feacher/account/components/logList/Log";

const page = async () => {
  const { user } = await getUser();
  const { data: org } = await getMyOrganization();

  if (org?.id) {
    return <Log orgId={org.id} currentUserId={user.id} />;
  }

  return <Log userId={user.id} currentUserId={user.id} />;
};

export default page;
