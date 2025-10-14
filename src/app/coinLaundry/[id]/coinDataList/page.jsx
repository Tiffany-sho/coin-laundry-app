import MoneyDataList from "@/app/feacher/collectMoney/components/coinDataList/CoinDataList";

async function fetcher(id) {
  const res = await fetch(
    `http://localhost:3000/api/coinLaundry/${id}/collectMoney`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const Page = async ({ params }) => {
  const { id } = await params;
  const data = await fetcher(id);
  return <MoneyDataList coinData={data} valiant="aStore" />;
};

export default Page;
