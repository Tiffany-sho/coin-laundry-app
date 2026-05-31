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
  Dialog,
  Portal,
  VStack,
  HStack,
  Button,
  Stack,
  Skeleton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { LuPlus, LuDownload, LuCalendarDays } from "@/app/feacher/Icon";
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
import { PeriodFilterButton, PeriodNav } from "./parts/SegmentedPeriod";
import ChangeStores from "./parts/ChangeStore";
import ExportPanel from "./parts/ExportPanel";
import MonthlySummaryCard from "./parts/MonthlySummaryCard";
import StoreRevenueChart from "./parts/StoreRevenueChart";

const MoneyDataList = ({ valiant, coinLaundry, myRole, plan = "free" }) => {
  const { selectedItem, open, setOpen, data, isFundsArrayLoading } = useUploadPage();

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
    const total = data.reduce((acc, cur) => acc + cur.totalFunds, 0);
    setTotalRevenue(total);
  }, [data]);

  return (
    <Box py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }} overflow="hidden" maxW="100%">
      <VStack align="stretch" gap={6}>

        {/* ── ヘッダー ── */}
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
              color="var(--teal-deeper)"
            >
              {valiant === "aStore" && `${coinLaundry.store}店`}
              {valiant === "manyStore" && `収益レポート`}
            </Heading>
            <HStack gap={2}>
              <ChangeStores />
              <Dialog.Root placement="center" scrollBehavior="inside">
                <Dialog.Trigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="cyan"
                    borderRadius="full"
                    fontWeight="semibold"
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    <LuDownload size={14} />
                    <Box as="span" display={{ base: "none", md: "inline" }}>収益データダウンロード</Box>
                    <Box as="span" display={{ base: "inline", md: "none" }}>DL</Box>
                  </Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop bg="blackAlpha.600" />
                  <Dialog.Positioner>
                    <Dialog.Content
                      borderRadius="xl"
                      maxW={{ base: "92%", md: "480px" }}
                      bg="var(--app-bg, #F0F9FF)"
                      boxShadow="2xl"
                    >
                      <Dialog.CloseTrigger asChild>
                        <CloseButton
                          size="sm"
                          position="absolute"
                          top={3}
                          right={3}
                          bg="var(--card-bg, #FFFFFF)"
                          borderRadius="full"
                          boxShadow="sm"
                          _hover={{ bg: "cyan.50", transform: "scale(1.1)" }}
                          transition="all 0.2s"
                        />
                      </Dialog.CloseTrigger>
                      <Dialog.Body p={{ base: 4, md: 5 }} pt={{ base: 10, md: 10 }}>
                        <ExportPanel
                          plan={plan}
                          storeId={valiant === "aStore" ? coinLaundry.id : null}
                        />
                      </Dialog.Body>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </HStack>
          </HStack>

          {valiant === "aStore" && (
            <Box display={{ base: "none", md: "block" }}>
              <Link
                href={`/collectMoney/${coinLaundry.id}/newData`}
                _hover={{ textDecoration: "none" }}
              >
                <Button
                  size="lg"
                  colorPalette="cyan"
                  borderRadius="full"
                  px={6}
                  fontWeight="semibold"
                >
                  <LuPlus /> 新規集金を記録
                </Button>
              </Link>
            </Box>
          )}
        </Flex>

        {/* ── Row 1: グラフ横並び（PC）/ 縦並び（mobile） ── */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: valiant === "manyStore" ? "1fr 1fr" : "1fr",
          }}
          gap={6}
          alignItems="start"
        >
          {/* 店舗別グラフ（manyStore のみ） */}
          {valiant === "manyStore" && (
            <GridItem minW={0}>
              <StoreRevenueChart />
            </GridItem>
          )}

          {/* 月別グラフカード（月別売上ヘッダー + 集金総額 + 期間フィルタ + チャート） */}
          <GridItem minW={0}>
            <Card.Root
              bg="var(--card-bg, #FFFFFF)"
              border="1px solid"
              borderColor="cyan.100"
              boxShadow="var(--shadow-sm)"
              borderRadius="xl"
            >
              <Card.Body p={{ base: 4, md: 6 }}>
                <VStack align="stretch" gap={4}>
                  {/* ヘッダー */}
                  <HStack gap={2}>
                    <Box color="var(--teal)">
                      <LuCalendarDays size={15} />
                    </Box>
                    <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
                      月別売上
                    </Text>
                  </HStack>

                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between" align="center">
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="var(--text-muted)"
                        textTransform="uppercase"
                        letterSpacing="widest"
                      >
                        集金総額
                      </Text>
                      <PeriodFilterButton />
                    </HStack>

                    <HStack align="baseline" gap={1}>
                      <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="semibold"
                        color="var(--text-muted)"
                      >
                        ¥
                      </Text>
                      {totalRevenue !== null ? (
                        <Text
                          fontSize={{ base: "4xl", md: "5xl" }}
                          fontWeight="black"
                          lineHeight="1"
                          letterSpacing="tight"
                        >
                          {totalRevenue.toLocaleString()}
                        </Text>
                      ) : (
                        <Skeleton height="10" width="40%" borderRadius="lg" />
                      )}
                      <Text
                        fontSize={{ base: "md", md: "lg" }}
                        fontWeight="medium"
                        color="var(--text-muted)"
                        alignSelf="flex-end"
                        pb={0.5}
                      >
                        円
                      </Text>
                      {data && (
                        <Text fontSize="xs" color="var(--text-muted)" alignSelf="flex-end" pb={1}>
                          累計{" "}
                          <Text as="span" fontWeight="bold" color="var(--text-main)">
                            {data.length}
                          </Text>{" "}
                          回
                        </Text>
                      )}
                    </HStack>

                    <PeriodNav />
                  </VStack>

                  {valiant === "aStore" && <MonoCoinDataChart id={coinLaundry.id} myRole={myRole} />}
                  {valiant === "manyStore" && <ManyCoinDataChart />}
                </VStack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>

        {/* ── Row 2: 月次サマリー | 売上履歴 ── */}
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={6}
          alignItems="start"
        >
          {/* 月次サマリー */}
          <GridItem minW={0}>
            <MonthlySummaryCard
              storeId={valiant === "aStore" ? coinLaundry.id : null}
            />
          </GridItem>

          {/* 売上履歴 */}
          <GridItem minW={0}>
            <VStack align="stretch" gap={4}>
              <HStack wrap="wrap" gap={2}>
                <Heading color="var(--teal-deeper)">売上履歴</Heading>
                <OrderSelecter />
              </HStack>

              {valiant === "aStore" && (
                <Box display={{ base: "block", md: "none" }}>
                  <Link
                    href={`/collectMoney/${coinLaundry.id}/newData`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Button
                      w="full"
                      size="md"
                      colorPalette="cyan"
                      borderRadius="full"
                      fontWeight="semibold"
                    >
                      <LuPlus /> 新規集金を記録
                    </Button>
                  </Link>
                </Box>
              )}

              <Stack>
                {valiant === "aStore" && (
                  <CoinMonoDataTable id={coinLaundry.id} myRole={myRole} />
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
                              borderColor="cyan.100"
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
                                {!isFundsArrayLoading && selectedItem.fundsArray && (
                                  <Box mt={2}>
                                    <DataClipBoard data={selectedItem} />
                                  </Box>
                                )}
                              </HStack>
                            </Drawer.Header>
                            <Drawer.Body p={6} pb={{ base: "100px", md: "24px" }}>
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
                                borderColor="cyan.100"
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
