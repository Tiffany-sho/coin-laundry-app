import { withAuth, corsPreflight } from "../../_lib/handler";
import { getLaundryState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (request, context) => {
  const { laundryId } = await context.params;
  return await getLaundryState(laundryId);
});

export const OPTIONS = corsPreflight;
