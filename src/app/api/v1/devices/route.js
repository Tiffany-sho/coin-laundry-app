import { withAuth, corsPreflight } from "../_lib/handler";
import {
  registerDeviceToken,
  deleteDeviceToken,
} from "@/app/api/supabaseFunctions/supabaseDatabase/devices/action";

export const dynamic = "force-dynamic";

/**
 * プッシュ通知のデバイストークン登録。
 * アプリは通知の許可が下りるたび / トークンが変わるたびに送る（冪等）。
 */
export const POST = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  return await registerDeviceToken({
    expoToken: body?.expoToken,
    platform: body?.platform,
    appVersion: body?.appVersion,
  });
});

/**
 * トークンの解除。ログアウト時に呼ぶ。
 *
 * ⚠️ 設計図（10-push.md）は `DELETE /api/v1/devices/:token` と書いているが、
 *    Expo のトークンは `ExponentPushToken[xxxx]` と角括弧を含むため URL パスに
 *    載せると環境ごとにエスケープの解釈が割れる。**body で受ける**ことにした。
 */
export const DELETE = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  return await deleteDeviceToken(body?.expoToken);
});

export const OPTIONS = corsPreflight;
