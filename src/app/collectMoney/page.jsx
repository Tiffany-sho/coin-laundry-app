import Link from "next/link";
import CoinLaundryList from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryList";
import { Heading, Button } from "@chakra-ui/react";

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
        集金店舗一覧
      </Heading>

      <Link href={"/collectMoney/coinDataList"}>
        <Button>売上一覧へ</Button>
      </Link>
      {datas.map((data) => {
        return (
          <CoinLaundryList
            coinLaundry={data}
            key={data._id}
            valiant="collect"
          />
        );
      })}
    </>
  );
};

export default Page;
