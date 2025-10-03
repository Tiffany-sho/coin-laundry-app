import Mono from "@/app/coinLaundry/[id]/components/Mono";

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const coinLaundryId = id;
  return <Mono id={coinLaundryId} />;
};

export default CoinLaundry;
