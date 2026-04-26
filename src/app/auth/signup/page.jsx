import { Suspense } from "react";
import { signup } from "../../api/supabaseFunctions/supabaseDatabase/auth/actions";
import AuthForm from "@/app/feacher/auth/components/AuthForm/AuthForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" action={signup} />
    </Suspense>
  );
}
