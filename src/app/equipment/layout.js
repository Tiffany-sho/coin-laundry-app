export const dynamic = "force-dynamic";
import { requireOrg } from "@/utils/orgGuard";

export default async function EquipmentLayout({ children }) {
  await requireOrg();
  return children;
}
