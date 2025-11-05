import ChangePassword from "@/app/feacher/auth/components/UpdataPassword/UpdatePassword";
import { updatePassword } from "../actions";

const page = () => {
  return <ChangePassword action={updatePassword} />;
};

export default page;
