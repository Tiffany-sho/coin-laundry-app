import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
} from "@/app/api/supabaseFunctions/supabaseDatabase/devices/action";

export const dynamic = "force-dynamic";

/**
 * 通知設定（profiles.notification_prefs）。
 *
 * ⚠️ プロフィール本体（GET /api/v1/profile）には混ぜていない。混ぜると、
 *    マイグレーション 002 が未適用の環境で getProfile ごと 42703 で失敗し、
 *    bootstrap の profile が null になって初期設定画面へ飛ばされる。
 *    ここを独立させておけば、壊れるのは通知設定画面だけで済む。
 */
export const GET = withAuth(async () => await getNotificationPrefs());

export const PATCH = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }
  return await updateNotificationPrefs(body);
});

export const OPTIONS = corsPreflight;
