import { getMachinesStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import EquipmentClientPage from "@/app/feacher/equipment/EquipmentClientPage";
import { Box } from "@chakra-ui/react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "設備管理 | Collecie" };

export default async function EquipmentPage() {
  const [machinesResult, orgResult] = await Promise.all([
    getMachinesStates(),
    getMyOrganization(),
  ]);

  if (orgResult.error === "ログインしてください") {
    redirect("/auth/login");
  }

  const storeStates = machinesResult.data ?? [];
  const myRole = orgResult.data?.myRole ?? "viewer";

  return (
    <Box
      p={{ base: 4, md: 6 }}
      pb={{ base: 28, md: 8 }}
      bg="var(--app-bg, #F0F9FF)"
      minH="100vh"
    >
      <EquipmentClientPage storeStates={storeStates} canEdit={myRole !== "viewer"} />
    </Box>
  );
}
