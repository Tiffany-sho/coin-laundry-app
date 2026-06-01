import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgMembership } from "@/utils/orgGuard";
import FooterNavbar from "./FooterNavber";

const FooterNavbarWrapper = async () => {
  const { user } = await getUser();
  if (!user) return null;

  const { hasOrg } = await getOrgMembership();
  if (!hasOrg) return null;
  return <FooterNavbar hasOrg={hasOrg} />;
};

export default FooterNavbarWrapper;
