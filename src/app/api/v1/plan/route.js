import { withAuth, corsPreflight } from "../_lib/handler";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export const dynamic = "force-dynamic";

/**
 * プラン情報。read-only（設計図 13.1）。
 * ⚠️ checkout / portal に相当するエンドポイントは絶対に生やさないこと。
 *    App Store Guideline 3.1.3(a) のリジェクト事由になる。
 */
export const GET = withAuth(async () => await getOrgPlan());

export const OPTIONS = corsPreflight;
