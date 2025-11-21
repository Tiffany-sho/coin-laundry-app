import { createClient } from "@/utils/supabase/server";
import Navbar from "./Navbar";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

const NavbarWrapper = async () => {
  const { user } = await getUser();
  const supabase = await createClient();
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
