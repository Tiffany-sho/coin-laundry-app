import { Suspense } from "react";
import CoinLaundryData from "./CoinLaundryData";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <CoinLaundryData />
    </Suspense>
  );
};

export default Page;
