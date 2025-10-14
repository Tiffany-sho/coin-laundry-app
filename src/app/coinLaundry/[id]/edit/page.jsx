import FormCard from "@/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm";

async function fetcher(id) {
  const res = await fetch(`http://localhost:3000/api/coinLaundry/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const updateLaundry = async ({ params }) => {
  const { id } = await params;
  const data = await fetcher(id);
  return <FormCard coinLaundry={data} method="PUT" />;
};

export default updateLaundry;
