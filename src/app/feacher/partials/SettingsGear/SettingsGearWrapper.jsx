import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import SettingsGear from "./SettingsGear";

/**
 * ⚠️ **ログインしている人にだけ出す。** 未ログインで押しても
 *    ログイン画面へ飛ばされるだけで、紹介ページの右上に歯車が浮く。
 *
 * ⚠️ **組織の有無では絞らない。** フッターナビは `hasOrg` で消えるが、
 *    **組織に入っていない人ほど設定が要る**（組織への参加とアカウント削除が
 *    その奥にある）。ここまで `hasOrg` で絞ると、その人の画面から
 *    設定への入口が 1 つも無くなる。
 */
const SettingsGearWrapper = async () => {
  const { user, authError } = await getUser();
  if (authError || !user) return null;
  return <SettingsGear />;
};

export default SettingsGearWrapper;
