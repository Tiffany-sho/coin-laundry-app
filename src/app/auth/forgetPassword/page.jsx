import SendEmail from "@/app/feacher/auth/components/ForgetPassword/ForgetPassword";
import { requestPasswordReset } from "@/app/api/supabaseFunctions/supabaseDatabase/auth/actions";
import React from "react";

export const dynamic = "force-dynamic";

const page = () => {
  return <SendEmail action={requestPasswordReset} />;
};

export default page;
