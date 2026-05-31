export const dynamic = "force-dynamic";
import { requireOrg } from "@/utils/orgGuard";
import { UploadPageProvider } from "@/app/feacher/collectMoney/context/UploadPageContext";

export default async function CollectMoneyLayout({ children }) {
  await requireOrg();
  return <UploadPageProvider>{children}</UploadPageProvider>;
}
