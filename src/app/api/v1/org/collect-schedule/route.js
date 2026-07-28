import { withAuth, corsPreflight } from "../../_lib/handler";
import {
  getCollectSchedule,
  updateCollectSchedule,
} from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

export const GET = withAuth(async () => await getCollectSchedule());

export const PUT = withAuth(async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  // null は「スケジュール未設定に戻す」を意味する
  if (body?.schedule === null) return await updateCollectSchedule(null);

  const schedule = body?.schedule;
  if (!schedule || !["weekly", "monthly"].includes(schedule.type)) {
    return { error: "スケジュールの種類が不正です", status: 400 };
  }
  if (!Array.isArray(schedule.days) || schedule.days.length === 0) {
    return { error: "集金日を 1 つ以上選んでください", status: 400 };
  }
  const max = schedule.type === "weekly" ? 6 : 31;
  const min = schedule.type === "weekly" ? 0 : 1;
  if (schedule.days.some((d) => !Number.isInteger(d) || d < min || d > max)) {
    return { error: "集金日の指定が不正です", status: 400 };
  }

  return await updateCollectSchedule(schedule);
});

export const OPTIONS = corsPreflight;
