export const dynamic = "force-dynamic";
import { requireOrg } from "@/utils/orgGuard";

export default async function InventoryLayout({ children }) {
  await requireOrg();
  return children;
}
