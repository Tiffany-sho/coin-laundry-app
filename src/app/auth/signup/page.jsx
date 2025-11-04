import { signup } from "../actions";

import AuthForm from "@/app/feacher/auth/components/AuthForm/AuthForm";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
