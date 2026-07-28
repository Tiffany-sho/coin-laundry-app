import { withAuth, corsPreflight } from "../../../_lib/handler";
import { updateMachinesState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";

export const dynamic = "force-dynamic";

// 設備の故障状況を更新。viewer 不可の判定は Server Action 側が持つ
export const PATCH = withAuth(async (request, context) => {
  const { laundryId } = await context.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: "リクエストの形式が不正です", status: 400 };
  }

  if (!Array.isArray(body?.machines)) {
    return { error: "設備の形式が不正です", status: 400 };
  }
  return await updateMachinesState(laundryId, body.machines);
});

export const OPTIONS = corsPreflight;
