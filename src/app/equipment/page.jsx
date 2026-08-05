import { redirect } from "next/navigation";

/**
 * 旧「設備管理」ページ。**2026-08-05 に `/inventory` へ統合した。**
 *
 * ⚠️ **消さずにリダイレクトで残す。** 上部ナビ・ブックマーク・
 *    フッターナビの `isActive` がこの URL を知っている。
 * ⚠️ `?tab=equipment` を付けて渡す。付けないと在庫が開き、
 *    **「設備管理」を押したのに在庫が出る**ことになる。
 */
export default function LegacyEquipmentPage() {
  redirect("/inventory?tab=equipment");
}
