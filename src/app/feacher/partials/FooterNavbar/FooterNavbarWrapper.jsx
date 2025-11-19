import { createClient } from "@/utils/supabase/server";
import FooterNavbar from "./FooterNavber";

const FooterNavbarWrapper = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  return <FooterNavbar />;
};

export default FooterNavbarWrapper;
