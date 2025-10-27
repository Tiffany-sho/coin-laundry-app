import MonoCard from "@/app/feacher/coinLandry/components/MonoCard/MonoCard";
import ErrorPage from "@/app/feacher/errorPage/ErrorPage/ErrorPage";

async function fetcher(id) {
  const res = await fetch(`http://localhost:3000/api/coinLaundry/${id}`);

  if (!res.ok) {
    const errorRes = await res.json();
    return {
      title: errorRes.msg,
      result: errorRes.result,
      status: res.status,
    };
  }
  return res.json();
}

const CoinLaundry = async ({ params }) => {
  const { id } = await params;
  const data = await fetcher(id);

  if (data.result === "failure")
    return <ErrorPage title={data.title} status={data.status} />;

  return <MonoCard coinLaundry={data} />;
};

export default CoinLaundry;
