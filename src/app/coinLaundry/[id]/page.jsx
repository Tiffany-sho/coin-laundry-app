import Mono from "@/app/components/Mono";

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const coinLaundryId = id;
  return <Mono id={coinLaundryId} />;
};

export default CoinLaundry;
