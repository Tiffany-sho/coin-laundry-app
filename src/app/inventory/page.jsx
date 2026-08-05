import { Suspense } from "react";
import {
  getMachinesStates,
  getStockStates,
} from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import ManageClientPage from "@/app/feacher/manage/ManageClientPage";
import { Box } from "@chakra-ui/react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "管理 | Collecie" };

/**
 * 管理（在庫 / 設備）。**2026-08-05 に `/equipment` を畳んでここへ統合した。**
 *
 * ⚠️ **URL は `/inventory` のまま。** フッターナビとホームのリンクが
 *    この URL を指しており、`isActive` も `/inventory` で判定している。
 *    ⚠️ `/equipment` はリダイレクトで残してある（ブックマーク）。
 *
 * ⚠️ **在庫と設備を両方引く。** 片方だけにして切り替えで取りに行く形にすると、
 *    切り替えた瞬間に空のカードが出てから中身が入る。
 *
 * ⚠️ **`useSearchParams` を使う子を `Suspense` で包む。** 包まないと
 *    このページが**ビルド時に静的化できず**エラーになる（Next の規則）。
 */
export default async function ManagePage() {
  const [stockResult, machinesResult, orgResult] = await Promise.all([
    getStockStates(),
    getMachinesStates(),
    getMyOrganization(),
  ]);

  if (
    stockResult.error === "ログインしてください" ||
    orgResult.error === "ログインしてください"
  ) {
    redirect("/auth/login");
  }

  const myRole = orgResult.data?.myRole ?? "viewer";

  return (
    <Box
      p={{ base: 4, md: 6 }}
      pb={{ base: 28, md: 8 }}
      bg="var(--app-bg, #F0F9FF)"
      minH="100vh"
    >
      <Suspense fallback={null}>
        <ManageClientPage
          stocks={stockResult.data ?? []}
          storeStates={machinesResult.data ?? []}
          canEdit={myRole !== "viewer"}
        />
      </Suspense>
    </Box>
  );
}
