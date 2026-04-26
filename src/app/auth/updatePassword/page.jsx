import ChangePassword from "@/app/feacher/auth/components/UpdataPassword/UpdatePassword";
import { updatePassword } from "../../api/supabaseFunctions/supabaseDatabase/auth/actions";

export const dynamic = "force-dynamic";

const page = () => {
  return <ChangePassword action={updatePassword} />;
};

export default page;
