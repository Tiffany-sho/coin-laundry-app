import Navbar from "./Navbar";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgMembership } from "@/utils/orgGuard";

const NavbarWrapper = async () => {
  const { user, authError } = await getUser();
  if (authError) return null;

  const { hasOrg } = user ? await getOrgMembership() : { hasOrg: false };
  return <Navbar user={user} hasOrg={hasOrg} />;
};

export default NavbarWrapper;
