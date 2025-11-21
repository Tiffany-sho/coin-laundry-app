import { login } from "../../api/supabaseFunctions/supabaseDatabase/auth/actions";
import AuthForm from "@/app/feacher/auth/components/AuthForm/AuthForm";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
