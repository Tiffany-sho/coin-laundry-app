import { useEffect, useState } from "react";
import { Card, Box ,Heading} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
import * as Order from "@/order/dateOrder";
import OrderSelecter from "./OrderSelecter";
import MonoCoinDataChart from "./MonoCoinDataChart";
import RankingTable from "./CoinDataRanking/CoinDataRanking";

const MoneyDataList = ({ valiant, coinData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [order, setOrder] = useState(["newer"]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");

      if (toastInfo) {
        const toastInfoStr = JSON.parse(toastInfo);

        toaster.create(toastInfoStr);
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  useEffect(() => {
    if (!coinData) return;

    const getSetOrder = () => {
      switch (order[0]) {
        case "newer":
          const newerArray = Order.newerOrder(coinData);
          return newerArray;
        case "older":
          const olderArray = Order.olderOrder(coinData);
          return olderArray;
        case "income":
          const incomeArray = Order.incomeOrder(coinData);
          return incomeArray;
        default:
          return coinData;
      }
    };
    const newArray = getSetOrder();
    setOrderData(newArray);
  }, [coinData, order]);

  useEffect(() => {
    if (coinData && selectedItem) {
      const updatedSelectedItem = coinData.find(
        (item) => item._id === selectedItem._id
      );
      setSelectedItem(updatedSelectedItem);
    }
  }, [coinData]);
   const sampleData = [
  { rank: 1, name: '田中太郎', score: 950, date: '2025-10-23', change: 50 },
  { rank: 2, name: '佐藤花子', score: 920, date: '2025-10-22', change: -10 },
  { rank: 3, name: '鈴木一郎', score: 880, date: '2025-10-23', change: 0 },
];
console.log(coinData)
  return (
    <>
      <Card.Root size="lg" w={selectedItem ? "2/3" : "100%"} mt="5%">
        <Card.Header>
          <Box w="100%" h="20%" >
            <Heading>過去の記録</Heading>
            {(valiant==="aStore") && <MonoCoinDataChart data={orderData}/>}
            {(valiant==="manyStore") && <RankingTable data={sampleData}/>}
            
          </Box>
        </Card.Header>
        <Card.Body color="fg.muted">
          <OrderSelecter setOrder={setOrder} />
          <Box>
            <MoneyDataTable
              items={orderData}
              selectedItemId={selectedItem?._id}
              onRowClick={setSelectedItem}
            />
          </Box>
        </Card.Body>
      </Card.Root>
      <Box w="1/3">
        {selectedItem && (
          <MoneyDataCard
            item={selectedItem}
            onRowClick={setSelectedItem}
            valiant={valiant}
            key={selectedItem._id}
          />
        )}
      </Box>
    </>
  );
};

export default MoneyDataList;
