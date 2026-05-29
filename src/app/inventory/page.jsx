import { getStockStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import InventoryClientPage from "@/app/feacher/inventory/InventoryClientPage";
import { Box } from "@chakra-ui/react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "在庫管理 | Collecie" };

export default async function InventoryPage() {
  const [stockResult, orgResult] = await Promise.all([
    getStockStates(),
    getMyOrganization(),
  ]);

  if (
    stockResult.error === "ログインしてください" ||
    orgResult.error === "ログインしてください"
  ) {
    redirect("/auth/login");
  }

  const stocks = stockResult.data ?? [];
  const myRole = orgResult.data?.myRole ?? "viewer";

  return (
    <Box
      p={{ base: 4, md: 6 }}
      pb={{ base: 28, md: 8 }}
      bg="var(--app-bg, #F0F9FF)"
      minH="100vh"
    >
      <InventoryClientPage stocks={stocks} canEdit={myRole !== "viewer"} />
    </Box>
  );
}
