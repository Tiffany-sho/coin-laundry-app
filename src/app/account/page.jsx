import { getUser } from "../api/supabaseFunctions/supabaseDatabase/user/action";
import AccountForm from "../feacher/account/components/accountForm/AccountForm";

export default async function Account() {
  const { user } = await getUser();

  return <AccountForm user={user} />;
}
