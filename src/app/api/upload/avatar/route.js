import { NextResponse } from "next/server";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request) {
  try {
    const { user } = await getUser();
    if (!user) return NextResponse.json({ error: "ログインしてください" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const path = `avatars/${user.id}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = createServiceClient();

    const { error: uploadError } = await supabase.storage
      .from("Laundry-Images")
      .upload(path, buffer, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("Laundry-Images").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Avatar URL save error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error("Avatar upload unexpected error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
