export const dynamic = "force-dynamic";
import { requireOrg } from "@/utils/orgGuard";

export default async function CoinLaundryLayout({ children }) {
  await requireOrg();
  return children;
}
