import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import FooterNavbar from "./FooterNavber";

const FooterNavbarWrapper = async () => {
  const { user } = await getUser();

  if (!user) {
    return;
  }

  return <FooterNavbar />;
};

export default FooterNavbarWrapper;
