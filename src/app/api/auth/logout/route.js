import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getUser } from "../../supabaseFunctions/supabaseDatabase/user/action";

export async function POST(req) {
  const supabase = await createClient();

  const { user } = await getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/", req.url), {
    status: 302,
  });
}
