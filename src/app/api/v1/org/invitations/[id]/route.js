import { withAuth, corsPreflight } from "../../../_lib/handler";
import { deleteInvitation } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { logAction } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";

export const dynamic = "force-dynamic";

export const DELETE = withAuth(async (request, context) => {
  const { id } = await context.params;
  const result = await deleteInvitation(id);
  // ⚠️ 宛先は取り消し後には引けないので出さない（id も出さない。ログに識別子は要らない）
  if (!result?.error) await logAction("保留中の招待を取り消しました");
  return result;
});

export const OPTIONS = corsPreflight;
