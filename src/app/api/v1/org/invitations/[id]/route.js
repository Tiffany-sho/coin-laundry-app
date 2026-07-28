import { withAuth, corsPreflight } from "../../../_lib/handler";
import { deleteInvitation } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  return await deleteInvitation(id);
});

export const OPTIONS = corsPreflight;
