import * as CoinLaundry from "@/app/feacher/coinLandry/components/CoinLaundryList/index";
import { Heading } from "@chakra-ui/react";

async function fetcher() {
  const res = await fetch(`http://localhost:3000/api/coinLaundry`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const Page = async () => {
  const datas = await fetcher();
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
