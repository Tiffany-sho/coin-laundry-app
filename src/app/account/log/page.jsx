import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import Log from "@/app/feacher/account/components/logList/Log";

const page = async () => {
  const { user } = await getUser();

  return <Log id={user.id} />;
};

export default page;
