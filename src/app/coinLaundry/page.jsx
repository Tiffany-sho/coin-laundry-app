import { Suspense } from "react";
import CoinLaundryData from "./CoinLaundryData";

export const dynamic = "force-dynamic";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <CoinLaundryData />
    </Suspense>
  );
};

export default Page;
