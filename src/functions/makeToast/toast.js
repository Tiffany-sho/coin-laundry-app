import { createMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { toaster } from "@/components/ui/toaster";

/**
 * トーストを出し、必要ならアクションログにも 1 行残す。
 *
 * ⚠️ **2026-07-31 まで、表示した文面を無条件に action_message へ書いていた。**
 *    そのため次の 2 つが起きていた。
 *
 *    1. **失敗トーストまで履歴に残っていた**（「プロフィールを更新に失敗しました」など）。
 *       起きていない操作が、起きたことのように並ぶ
 *    2. **個人に閉じた操作も組織全員のログに出ていた**（プロフィール・アイコン・
 *       集金方法・初回登録）。ログは組織のメンバー全員が読む
 *
 *    アプリ側（BFF）の方針と揃える。docs/ios/06-api-bff.md と
 *    coinlaundy_app_iOS/docs/contracts.md の「アクションログ」を参照。
 *
 * @param {"success"|"error"|"warning"|"info"} type
 * @param {string} target 画面に出す文面
 * @param {{ log?: boolean, logMessage?: string }} [options]
 *   - `log`   … 既定は「error 以外は残す」。個人に閉じた操作では false を渡す
 *   - `logMessage` … ログにだけ別の文面を使う。
 *     ⚠️ **トーストに出してよくてもログに残してはいけない値**（メールアドレスなど）が
 *     あるときに使う。ログは組織の全員が読むため
 */
export const showToast = async (type, target, options = {}) => {
  toaster.create({
    description: target,
    type,
    closable: true,
  });

  // ⚠️ 失敗は既定で残さない。「やろうとしたが失敗した」は履歴ではない
  const shouldLog = options.log ?? type !== "error";
  if (!shouldLog) return { actionMessageError: null };

  const result = await createMessage(options.logMessage ?? target);
  return { actionMessageError: result.error };
};
