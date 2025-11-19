import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";

const NavbarWrapper = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    if (!data || data.length === 0 || error) {
      return;
    }
    return <Navbar user={user} />;
  } else {
    return <Navbar user={user} />;
  }
};

export default NavbarWrapper;
