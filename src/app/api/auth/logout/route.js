import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getUser } from "../../supabaseFunctions/supabaseDatabase/user/action";
import { absoluteUrl } from "@/functions/requestOrigin";

export async function POST(req) {
  const supabase = await createClient();

  const { user } = await getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  /*
    ⚠️ **`new URL("/", req.url)` に戻さないこと。** dev を `-H 0.0.0.0` で
       立てると `req.url` が `http://0.0.0.0:3000/...` になり、サインアウトの
       たびに **ERR_ADDRESS_INVALID** で真っ白になる（2026-08-18 に踏んだ）。
       宛先は Host ヘッダから組み立てる（`requestOrigin.js`）。
  */
  return NextResponse.redirect(absoluteUrl(req, "/"), {
    status: 302,
  });
}
