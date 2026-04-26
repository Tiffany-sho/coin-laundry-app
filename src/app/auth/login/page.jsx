import { Suspense } from "react";
import { login } from "../../api/supabaseFunctions/supabaseDatabase/auth/actions";
import AuthForm from "@/app/feacher/auth/components/AuthForm/AuthForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" action={login} />
    </Suspense>
  );
}
