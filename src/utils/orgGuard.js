import { redirect } from "next/navigation";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { createClient } from "@/utils/supabase/server";

/**
 * Returns the current user's org membership status without throwing.
 * Safe to call from Server Components and Wrappers.
 */
export async function getOrgMembership() {
  const { user } = await getUser();
  if (!user) return { authenticated: false, hasOrg: false, isAdmin: false, role: null };

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    authenticated: true,
    hasOrg: !!data,
    isAdmin: data?.role === "admin",
    role: data?.role ?? null,
  };
}

/**
 * Call from a layout to redirect non-org users to /settings.
 * Unauthenticated users are ignored (middleware handles login redirect).
 */
export async function requireOrg() {
  const { user } = await getUser();
  if (!user) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    redirect("/settings");
  }
}
