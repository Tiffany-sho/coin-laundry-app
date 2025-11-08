import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";

const NavbarWrapper = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Navbar user={user} />;
};

export default NavbarWrapper;
