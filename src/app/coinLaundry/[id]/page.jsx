import MonoCard from "@/app/feacher/coinLandry/components/MonoCard/MonoCard";

async function fetcher(id) {
  const res = await fetch(`http://localhost:3000/api/coinLaundry/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const data = await fetcher(id);
  return <MonoCard coinLaundry={data} />;
};

export default CoinLaundry;
