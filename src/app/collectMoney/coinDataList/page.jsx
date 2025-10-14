import CoinDataList from "@/app/feacher/collectMoney/components/coinDataList/CoinDataList";

async function fetcher() {
  const res = await fetch(`http://localhost:3000/api/collectMoney`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const Page = async () => {
  const data = await fetcher();
  return <CoinDataList coinData={data} valiant="manyStore" />;
};

export default Page;
