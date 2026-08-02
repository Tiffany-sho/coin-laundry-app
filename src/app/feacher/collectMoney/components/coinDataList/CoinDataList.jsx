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
} from "@chakra-ui/react";
import { LuPlus, LuDownload, LuCalendarDays, LuWallet } from "@/app/feacher/Icon";
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
import TotalRevenueCard from "./parts/TotalRevenueCard";
import MachineBreakdownCard from "./parts/MachineBreakdownCard";
import MethodBreakdownCard from "./parts/MethodBreakdownCard";
import RevenueTabs from "./parts/RevenueTabs";
import CollecterFilter from "./parts/CollecterFilter";
import useStoreRevenue from "../../hooks/useStoreRevenue";

/**
 * グラフの切り替えタブ。
 *
 * ⚠️ **機器別は店舗ページだけ。** 組織全体で出すと、店舗をまたいで同じ名前
 *    （「洗濯機1」）の別の台が合算されて意味の無い数字になる。
 */
const TABS_MANY = [
  { value: "store", label: "店舗別" },
  { value: "monthly", label: "月別" },
  { value: "method", label: "支払方法別" },
  { value: "summary", label: "月次サマリー" },
];

const TABS_MONO = [
  { value: "monthly", label: "月別" },
  { value: "machine", label: "機器別" },
  { value: "method", label: "支払方法別" },
  { value: "summary", label: "月次サマリー" },
];

const MoneyDataList = ({ valiant, coinLaundry, myRole, plan = "free" }) => {
  const { selectedItem, open, setOpen, data, isFundsArrayLoading } = useUploadPage();

  const isMono = valiant === "aStore";
  const tabs = isMono ? TABS_MONO : TABS_MANY;
  const [tab, setTab] = useState("monthly");

  /** ⚠️ 全期間の集計。総額収益カードと店舗別グラフで共有するのでここで 1 回だけ引く */
  const { stores: storeRevenue, loading: revenueLoading } = useStoreRevenue();

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
              {/* 経費は組織単位なので収益レポート側にだけ置く */}
              {!isMono && (
                <Link href="/collectMoney/expenses" _hover={{ textDecoration: "none" }}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="cyan"
                    borderRadius="full"
                    fontWeight="semibold"
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    <LuWallet size={14} />
                    <Box as="span" display={{ base: "none", md: "inline" }}>経費</Box>
                  </Button>
                </Link>
              )}
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

        {/* ── 総額収益（タブの外。期間の切り替えで変わらない数字） ── */}
        <TotalRevenueCard
          stores={storeRevenue}
          loading={revenueLoading}
          storeId={isMono ? coinLaundry.id : null}
        />

        {/* ── グラフ切り替え ── */}
        <RevenueTabs tabs={tabs} value={tab} onChange={setTab} />

        {/* ── 選ばれたグラフ 1 枚だけを描く ── */}
        <Box minW={0}>
          {/* 店舗別（組織全体のみ） */}
          {tab === "store" && !isMono && (
            <StoreRevenueChart stores={storeRevenue} loading={revenueLoading} />
          )}

          {/* 機器別（店舗ページのみ） */}
          {tab === "machine" && isMono && <MachineBreakdownCard storeId={coinLaundry.id} />}

          {/* 支払方法別。組織全体では店舗をまたいで名前で 1 本にまとまる */}
          {tab === "method" && (
            <MethodBreakdownCard storeId={isMono ? coinLaundry.id : null} />
          )}

          {/* 月次サマリー */}
          {tab === "summary" && (
            <MonthlySummaryCard storeId={isMono ? coinLaundry.id : null} />
          )}

          {/* 月別グラフカード（月別売上ヘッダー + 集金総額 + 期間フィルタ + チャート） */}
          {tab === "monthly" && (
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
          )}
        </Box>

        {/* ── 売上履歴（タブの外。常に手前に置く） ── */}
        <Box minW={0}>
            <VStack align="stretch" gap={4}>
              <HStack wrap="wrap" gap={2}>
                <Heading color="var(--teal-deeper)">売上履歴</Heading>
                <OrderSelecter />
              </HStack>

              {/* 集金者で絞り込む。1 人しかいないときは何も出ない */}
              <CollecterFilter />

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
        </Box>

      </VStack>
    </Box>
  );
};

export default MoneyDataList;
