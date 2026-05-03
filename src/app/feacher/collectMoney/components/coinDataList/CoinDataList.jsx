"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  Link,
  Heading,
  Flex,
  CloseButton,
  Drawer,
  Portal,
  VStack,
  HStack,
  Button,
  Stack,
  Skeleton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { LuPlus } from "@/app/feacher/Icon";
import { useUploadPage } from "../../context/UploadPageContext";
import { toaster } from "@/components/ui/toaster";
import MoneyDataCard from "./DrawerContext/CoinDataCard";
import MonoCoinDataChart from "./Chart/MonoCoinDataChart";
import ManyCoinDataChart from "./Chart/ManyCoinDataChart";
import CoinManyDataTable from "./Table/CoinManyDataTable";
import CoinMonoDataTable from "./Table/CoinMonoDataTable";
import AddDataBtn from "./parts/AddDataBtn";
import OrderSelecter from "./parts/OrderSelecter";
import DataClipBoard from "./parts/DataClipBoard";
import SegmentedPeriod from "./parts/SegmentedPeriod";
import ChangeStores from "./parts/ChangeStore";
import { createNowData } from "@/functions/makeDate/date";

const MoneyDataList = ({ valiant, coinLaundry, myRole }) => {
  const { selectedItem, open, setOpen, data } = useUploadPage();

  const [totalRevenue, setTotalRevenue] = useState(null);
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
    if (!data) return;
    const totalRevenue = data.reduce((accumulator, current) => {
      return accumulator + current.totalFunds;
    }, 0);
    setTotalRevenue(totalRevenue);
  }, [data]);

  return (
    <Box py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={6}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <HStack justify="space-between">
            <Heading
              size={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              {valiant === "aStore" && `${coinLaundry.store}店`}
              {valiant === "manyStore" && `収益レポート`}
            </Heading>
            <ChangeStores />
          </HStack>

          {valiant === "aStore" && (
            <Link
              href={`/collectMoney/${coinLaundry.id}/newData`}
              _hover={{ textDecoration: "none" }}
            >
              <Button
                size={{ base: "md", md: "lg" }}
                colorPalette="blue"
                borderRadius="full"
                px={6}
                fontWeight="semibold"
              >
                <LuPlus /> 新規集金を記録
              </Button>
            </Link>
          )}
        </Flex>

        <Grid
          templateColumns={{ base: "1fr", md: "3fr 2fr" }}
          gap={6}
          alignItems="start"
        >
          {/* 左列：集金総額カード＋チャート（PC時 sticky） */}
          <GridItem position="sticky" top="64px" alignSelf="start">
            <VStack align="stretch" gap={6}>
              {/* 集金総額カード */}
              <Card.Root borderRadius="2xl" variant="elevated">
                <Card.Body p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="fg.muted"
                        textTransform="uppercase"
                        letterSpacing="widest"
                      >
                        集金総額
                      </Text>
                      {data && data.length > 0 && (
                        <Text fontSize="xs" color="fg.muted">
                          {createNowData(data[0].date)} 〜{" "}
                          {createNowData(data[data.length - 1].date)}
                        </Text>
                      )}
                    </HStack>

                    <HStack align="baseline" gap={1}>
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="semibold"
                        color="fg.muted"
                      >
                        ¥
                      </Text>
                      {totalRevenue !== null ? (
                        <Text
                          fontSize={{ base: "5xl", md: "7xl" }}
                          fontWeight="black"
                          lineHeight="1"
                          letterSpacing="tight"
                        >
                          {totalRevenue.toLocaleString()}
                        </Text>
                      ) : (
                        <Skeleton height="14" width="40%" borderRadius="lg" />
                      )}
                      <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="medium"
                        color="fg.muted"
                        alignSelf="flex-end"
                        pb={1}
                      >
                        円
                      </Text>
                    </HStack>

                    {data && (
                      <Text fontSize="sm" color="fg.muted">
                        累計{" "}
                        <Text as="span" fontWeight="bold" color="fg">
                          {data.length}
                        </Text>{" "}
                        回の集金
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* 期間スライダー＋チャートカード */}
              <Card.Root borderRadius="2xl" variant="elevated">
                <Card.Body p={{ base: 4, md: 6 }}>
                  <VStack align="stretch" gap={4}>
                    <SegmentedPeriod />
                    {valiant === "aStore" && <MonoCoinDataChart id={coinLaundry.id} />}
                    {valiant === "manyStore" && <ManyCoinDataChart />}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          </GridItem>

          {/* 右列：売上履歴（スクロール） */}
          <GridItem>
            <VStack align="stretch" gap={4}>
              <HStack>
                <Heading>売上履歴</Heading>
                <OrderSelecter />
              </HStack>

              <Stack>
                {valiant === "aStore" && (
                  <CoinMonoDataTable id={coinLaundry.id} />
                )}
                {valiant === "manyStore" && <CoinManyDataTable />}

                {valiant === "aStore" && <AddDataBtn id={coinLaundry.id} />}
                {valiant === "manyStore" && <AddDataBtn />}

                <Drawer.Root
                  size={{ base: "xs", md: "md" }}
                  open={open}
                  onOpenChange={(e) => {
                    setOpen(e.open);
                  }}
                >
                  <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                      <Drawer.Content borderRadius="24px 0 0 24px">
                        {selectedItem && (
                          <>
                            <Drawer.Header
                              borderBottom="2px solid"
                              borderColor="gray.200"
                              p={6}
                            >
                              <HStack align="stretch" pt={8}>
                                {valiant === "aStore" && (
                                  <Heading size="lg" fontWeight="bold">
                                    {selectedItem.laundryName}店
                                  </Heading>
                                )}
                                {valiant === "manyStore" && (
                                  <Link
                                    href={`/coinLaundry/${selectedItem.laundryId}/coinDataList`}
                                    fontSize="xl"
                                    fontWeight="bold"
                                    _hover={{
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {selectedItem.laundryName}店
                                  </Link>
                                )}
                                <Box mt={2}>
                                  <DataClipBoard data={selectedItem} />
                                </Box>
                              </HStack>
                            </Drawer.Header>
                            <Drawer.Body p={6}>
                              <MoneyDataCard key={selectedItem._id} myRole={myRole} />
                            </Drawer.Body>
                            <Drawer.CloseTrigger asChild>
                              <CloseButton
                                size="lg"
                                position="absolute"
                                top={4}
                                right={4}
                                borderRadius="full"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{
                                  transform: "rotate(90deg)",
                                }}
                                transition="all 0.2s"
                              />
                            </Drawer.CloseTrigger>
                          </>
                        )}
                      </Drawer.Content>
                    </Drawer.Positioner>
                  </Portal>
                </Drawer.Root>
              </Stack>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default MoneyDataList;
