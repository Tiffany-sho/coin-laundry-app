import { createMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { toaster } from "@/components/ui/toaster";

export const showToast = async (type, target) => {
  toaster.create({
    description: target,
    type,
    closable: true,
  });

  const result = await createMessage(target);
  return { actionMessageError: result.error };
};
