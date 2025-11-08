// CoinDataList.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Text,
  Link,
  Heading,
  Flex,
  CloseButton,
  Drawer,
  Portal,
  Badge,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import MoneyDataTable from "@/app/feacher/collectMoney/components/coinDataList/CoinDataTable";
import MoneyDataCard from "@/app/feacher/collectMoney/components/coinDataList/CoinDataCard";
import * as Order from "@/createArray/dateOrder";
import OrderSelecter from "../OrderSelecter";
import { createNowData } from "@/date";
import MonoCoinDataChart from "../MonoCoinDataChart";
import ManyCoinDataChart from "../ManyCoinDataChart";
import DataClipBoard from "../DataClipBoard";
import styles from "./CoinDataList.module.css";

const MoneyDataList = ({ valiant, coinData }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
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
        (item) => item.id === selectedItem.id
      );
      setSelectedItem(updatedSelectedItem);
    }
  }, [coinData]);

  const totalRevenue =
    coinData.reduce((accumulator, current) => {
      const summary = current.fundsArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.funds);
      }, 0);
      return accumulator + summary;
    }, 0) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <Card.Root size="lg" className={styles.mainCard}>
          <Card.Header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerTop}>
                <div className={styles.titleSection}>
                  <Heading
                    size={{ base: "xl", md: "2xl" }}
                    className={styles.title}
                  >
                    {valiant === "aStore" && `${coinData[0].laundryName}店`}
                    {valiant === "manyStore" && "全データ一覧"}
                  </Heading>
                  {valiant === "aStore" && (
                    <Link
                      href={`/collectMoney/${coinData[0].laundryId}/newData`}
                      className={styles.continueLink}
                    >
                      集金を続ける
                    </Link>
                  )}
                </div>
              </div>

              <div className={styles.totalRevenueCard}>
                <div className={styles.revenueLabel}>総額</div>
                <div className={styles.revenueAmount}>
                  <span className={styles.currencySymbol}>¥</span>
                  <span className={styles.amount}>
                    {totalRevenue.toLocaleString()}
                  </span>
                  <Badge colorScheme="green" className={styles.badge}>
                    円
                  </Badge>
                </div>
              </div>
            </div>

            <div className={styles.chartContainer}>
              {valiant === "aStore" && <MonoCoinDataChart data={orderData} />}
              {valiant === "manyStore" && (
                <ManyCoinDataChart data={orderData} />
              )}
            </div>
          </Card.Header>

          <Card.Body className={styles.body}>
            <div className={styles.orderselecterWrapper}>
              <OrderSelecter setOrder={setOrder} />
            </div>

            <div className={styles.tableWrapper}>
              <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
                <Drawer.Trigger asChild>
                  <Box>
                    <MoneyDataTable
                      items={orderData}
                      selectedItemId={selectedItem?._id}
                      onRowClick={setSelectedItem}
                      open={open}
                    />
                  </Box>
                </Drawer.Trigger>
                <Portal>
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content className={styles.drawerContent}>
                      {selectedItem && (
                        <>
                          <Drawer.Header className={styles.drawerHeader}>
                            <Drawer.Title>
                              <Flex
                                justifyContent="space-between"
                                alignItems="center"
                                className={styles.drawerTitleWrapper}
                              >
                                <Box>
                                  {valiant === "aStore" && (
                                    <Heading
                                      size="lg"
                                      className={styles.drawerTitle}
                                    >
                                      {selectedItem.laundryName}店
                                    </Heading>
                                  )}
                                  {valiant === "manyStore" && (
                                    <Link
                                      variant="underline"
                                      href={`/coinLaundry/${selectedItem.laundryId}/coinDataList`}
                                      className={styles.drawerLink}
                                    >
                                      {selectedItem.laundryName}店
                                    </Link>
                                  )}
                                  <Text className={styles.drawerDate}>
                                    {createNowData(selectedItem.date)}
                                  </Text>
                                </Box>
                                <DataClipBoard data={selectedItem} />
                              </Flex>
                            </Drawer.Title>
                          </Drawer.Header>
                          <Drawer.Body className={styles.drawerBody}>
                            <MoneyDataCard
                              item={selectedItem}
                              onRowClick={setSelectedItem}
                              setOpen={setOpen}
                              valiant={valiant}
                              key={selectedItem._id}
                            />
                          </Drawer.Body>
                          <Drawer.CloseTrigger asChild>
                            <CloseButton
                              size="lg"
                              className={styles.closeButton}
                            />
                          </Drawer.CloseTrigger>
                        </>
                      )}
                    </Drawer.Content>
                  </Drawer.Positioner>
                </Portal>
              </Drawer.Root>
            </div>
          </Card.Body>
        </Card.Root>
      </div>
    </div>
  );
};

export default MoneyDataList;
