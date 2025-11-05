import SendEmail from "@/app/feacher/auth/components/ForgetPassword/ForgetPassword";
import { requestPasswordReset } from "@/app/auth/actions";
import React from "react";

const page = () => {
  return <SendEmail action={requestPasswordReset} />;
};

export default page;
