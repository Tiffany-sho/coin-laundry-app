import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

const NavbarWrapper = async () => {
  const { user, authError } = await getUser();

  if (authError) {
    return;
  }

  return <Navbar user={user} />;
};

export default NavbarWrapper;
