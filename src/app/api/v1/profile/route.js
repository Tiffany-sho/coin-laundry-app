import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getProfile,
  updateProfile,
  registerProfile,
  setCollectMethod,
} from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getProfile());

/** 初回登録。プロフィール未作成のユーザーが最初に叩く */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  if (!body?.username) return { error: "表示名を入力してください", status: 400 };

  // ⚠️ collectMethod に入れてよいのは "machines" / "total" だけ。
  //    Web の useCollectMethod.js が collectMethod === "machines" で判定しているため、
  //    別表記を書き込むと Web 側で「まとめて集金」に見えてしまう。
  const collectMethod = body.collectMethod === "total" ? "total" : "machines";
  const role = ["admin", "collecter", "viewer"].includes(body.role) ? body.role : "collecter";

  return await registerProfile({
    fullname: body.fullname ?? "",
    username: body.username,
    collectMethod,
    role,
  });
});

export const PATCH = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  if (body?.collectMethod !== undefined) {
    return await setCollectMethod(body.collectMethod);
  }
  if (body?.username !== undefined || body?.fullname !== undefined) {
    return await updateProfile({ fullname: body.fullname, username: body.username });
  }
  return { error: "更新する内容がありません", status: 400 };
});

export const OPTIONS = corsPreflight;
