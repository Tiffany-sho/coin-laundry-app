import { withAuth, corsPreflight } from "../_lib/handler";
import { getAllLaundryStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getAllLaundryStates());

export const OPTIONS = corsPreflight;
