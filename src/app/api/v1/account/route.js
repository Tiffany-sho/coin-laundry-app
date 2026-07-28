import { withAuth, corsPreflight } from "../_lib/handler";
import {
  getAccountDeletionSummary,
  deleteAccount,
} from "@/app/api/supabaseFunctions/supabaseDatabase/account/action";

export const dynamic = "force-dynamic";

/** 削除前に「何が消えるか」を出すための集計（App Store の削除フロー要件） */
export const GET = withAuth(async () => await getAccountDeletionSummary());

/**
 * アカウント削除。App Store Guideline 5.1.1(v) によりアプリ内から開始できる必要がある。
 * 誤操作を防ぐため、アプリ側でパスワード再入力と確認ダイアログを挟んでから叩く。
 */
export const DELETE = withAuth(async () => await deleteAccount());

export const OPTIONS = corsPreflight;
