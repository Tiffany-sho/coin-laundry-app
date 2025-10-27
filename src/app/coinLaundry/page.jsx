import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading } from "@chakra-ui/react";

async function fetcher() {
  const res = await fetch(`http://localhost:3000/api/coinLaundry`);

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

const Page = async () => {
  const datas = await fetcher();
  if (datas.result === "failure")
    return <ErrorPage title={datas.title} status={datas.status} />;

  return (
    <>
      <Heading textStyle="3xl" textAlign="center" my="4" fontWeight="bold">
        店舗一覧
      </Heading>

      {datas.map((data) => {
        return (
          <CoinLaundry.CoinLaundryList
            coinLaundry={data}
            key={data._id}
            valiant="view"
          />
        );
      })}
      <CoinLaundry.AddBtn />
    </>
  );
};

export default Page;
