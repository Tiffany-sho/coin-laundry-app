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
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuPlus, LuDownload, LuCalendarDays } from "@/app/feacher/Icon";
import { useUploadPage } from "../../context/UploadPageContext";
import { toaster } from "@/components/ui/toaster";
import MoneyDataCard from "./DrawerContext/CoinDataCard";
import MonoCoinDataChart from "./Chart/MonoCoinDataChart";
import ManyCoinDataChart from "./Chart/ManyCoinDataChart";
import CoinManyDataTable from "./Table/CoinManyDataTable";
import CoinMonoDataTable from "./Table/CoinMonoDataTable";
import OrderSelecter from "./parts/OrderSelecter";
import DataClipBoard from "./parts/DataClipBoard";
import { PeriodFilterButton, PeriodNav } from "./parts/SegmentedPeriod";
import ChangeStores from "./parts/ChangeStore";
import ExportPanel from "./parts/ExportPanel";
import MonthlyProfitCard from "./parts/MonthlyProfitCard";
import StoreRevenueChart from "./parts/StoreRevenueChart";
import TotalRevenueCard from "./parts/TotalRevenueCard";
import MachineBreakdownCard from "./parts/MachineBreakdownCard";
import MethodBreakdownCard from "./parts/MethodBreakdownCard";
import RevenueTabs from "./parts/RevenueTabs";
import CollectStartButton from "@/app/feacher/collectMoney/components/collectMoneyForm/parts/CollectStartButton";
import CollecterFilter from "./parts/CollecterFilter";
import useStoreRevenue from "../../hooks/useStoreRevenue";

/**
 * グラフの切り替えタブ。
 *
 * ⚠️ **機器別は店舗ページだけ。** 組織全体で出すと、店舗をまたいで同じ名前
 *    （「洗濯機1」）の別の台が合算されて意味の無い数字になる。
 *
 * ⚠️ **「月次サマリー」は 2026-08-03 に「月別利益」へ差し替えた**（アプリと同時）。
 *    前月比・前年同月比の表より、売上 − 経費のほうが日々の判断に効くため。
 * ⚠️ **経費を使わない組織では「月別利益」を出さない**（`expenses_enabled`）。
 *    経費が常に 0 になり、月別売上と同じ形の棒が 2 枚並ぶだけになる。
 */
const TABS_MANY = [
  { value: "store", label: "店舗別" },
  { value: "monthly", label: "月別" },
  { value: "method", label: "支払方法別" },
  { value: "profit", label: "月別利益" },
];

const TABS_MONO = [
  { value: "monthly", label: "月別" },
  { value: "machine", label: "機器別" },
  { value: "method", label: "支払方法別" },
  { value: "profit", label: "月別利益" },
];

const MoneyDataList = ({
  valiant,
  coinLaundry,
  myRole,
  plan = "free",
  /* ⚠️ 未指定＝使う。サーバの既定と揃える（false に倒すと機能が黙って消える） */
  expensesEnabled = true,
}) => {
  const { selectedItem, open, setOpen, data, isFundsArrayLoading } = useUploadPage();

  const isMono = valiant === "aStore";
  const allTabs = isMono ? TABS_MONO : TABS_MANY;
  const tabs = expensesEnabled ? allTabs : allTabs.filter((t) => t.value !== "profit");
  const [tab, setTab] = useState("monthly");
  /* ⚠️ 経費を切った直後に「月別利益」を選んだままにしない（タブごと消えるため） */
  const activeTab = tab === "profit" && !expensesEnabled ? "monthly" : tab;

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

  /**
   * PC かどうか。
   *
   * ⚠️ **しきい値は `xl`（1280px）。** `lg`（992px）で 2 列にすると 1 枚あたり
   *    470px ほどしか取れず、店舗別の横棒グラフで店舗名が潰れる。
   * ⚠️ **SSR では `base`（false）が返る。** PC でも一瞬スマホ構成が出てから
   *    入れ替わる。`display` で出し分ければ避けられるが、下の理由で採らない。
   */
  const isWide = useBreakpointValue({ base: false, xl: true }) ?? false;

  /*
    グラフは**要素として組み立てておき、PC とスマホで置き場所だけ変える。**

    ⚠️ **同じ中身を 2 か所に書かないこと。** タブ用とダッシュボード用で
       別々に書くと、片方だけ直して数字の出どころが食い違う。
    ⚠️ **CSS の `display` で出し分けないこと。** 両方を描くと隠れている側も
       マウントされ、**同じデータを 2 度取りに行く**（タブ 1 枚 + ダッシュボード 4 枚）。
    ⚠️ ここで作るだけならマウントされない。描画された 1 つだけが動く。
  */
  const storeChart = <StoreRevenueChart stores={storeRevenue} loading={revenueLoading} />;
  const machineChart = isMono ? <MachineBreakdownCard storeId={coinLaundry.id} /> : null;
  const methodChart = <MethodBreakdownCard storeId={isMono ? coinLaundry.id : null} />;
  const profitChart = <MonthlyProfitCard storeId={isMono ? coinLaundry.id : null} />;
  const monthlyChart = (
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
  );

  return (
    /*
      ⚠️ **PC では横幅を使い切る。** ただし上限は付ける（`1720px`）。
         無制限にすると 4K で 1 行が伸びきり、左端のラベルと右端の数字が
         離れすぎて目で追えなくなる（在庫カードで同じことが起きている）。
    */
    <Box
      py={{ base: 6, md: 8 }}
      px={{ base: 4, md: 6, xl: 8 }}
      overflow="hidden"
      maxW={{ base: "100%", xl: "1720px" }}
      mx="auto"
    >
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
              {/*
                ⚠️ **経費への入口はここに置かない**（2026-08-05）。
                   「月別利益」カードの中に集約してある（アプリと同じ）。棒が
                   「売上 − 経費」なので、経費を見たくなるのはあれを見た瞬間。
                   ⚠️ 2 か所に置くと、経費を使わない組織での出し分け（012）も
                      2 か所で見ることになる。
              */}
              <ChangeStores />
              <Dialog.Root placement="center" scrollBehavior="inside">
                {/*
                  ⚠️ **塗りつぶしにする**（2026-08-05）。ほかの操作と同じ枠線だけの
                     ボタンで、しかもスマホでは「DL」としか出ておらず、
                     **確定申告の材料を出す入口だと気づかれていなかった。**
                  ⚠️ **スマホでも「書き出し」と語で出す。** アイコンだけ・略語だけに
                     しないこと（何が起きるか分からないボタンになる）。
                */}
                {/*
                  ⚠️ **右下に固定する**（2026-08-05）。ヘッダに並べていた頃は
                     ほかの操作に埋もれ、**確定申告の材料を出す入口だと
                     気づかれていなかった。**
                  ⚠️ **`bottom` は店舗一覧の「＋」（`AddBtn`）と同じ値にする。**
                     フッターナビの上に載せるための逃げなので、片方だけ変えると
                     ページによってボタンの高さが変わる。
                  ⚠️ **`zIndex` はフッターナビより上、ダイアログより下。**
                     上げすぎると書き出しのダイアログの上にボタンが浮く。
                */}
                <Dialog.Trigger asChild>
                  <Button
                    position="fixed"
                    bottom={{ base: "15%", md: "5%" }}
                    right={{ base: "5%", md: "5%" }}
                    zIndex="1350"
                    colorPalette="cyan"
                    borderRadius="full"
                    fontWeight="semibold"
                    fontSize={{ base: "sm", md: "md" }}
                    px={{ base: 5, md: 6 }}
                    h={{ base: "52px", md: "56px" }}
                    boxShadow="0 4px 15px rgba(8,145,178,0.35)"
                    _active={{ transform: "scale(0.96)" }}
                    transition="all 0.2s"
                  >
                    <LuDownload size={18} />
                    書き出し
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
              {/* ⚠️ 直接 Link にしない。支払方法がある店舗では何を集金するか聞く */}
              <CollectStartButton store={coinLaundry}>
                <Button
                  size="lg"
                  colorPalette="cyan"
                  borderRadius="full"
                  px={6}
                  fontWeight="semibold"
                >
                  <LuPlus /> 新規集金を記録
                </Button>
              </CollectStartButton>
            </Box>
          )}
        </Flex>

        {/* ── 総額収益（タブの外。期間の切り替えで変わらない数字） ── */}
        <TotalRevenueCard
          stores={storeRevenue}
          loading={revenueLoading}
          storeId={isMono ? coinLaundry.id : null}
        />

        {/*
          ── グラフ ──

          ⚠️ **PC とスマホで構成が違う**（2026-08-18 に PC を作り直した）。
             スマホはタブで 1 枚ずつ。PC は**全部を並べたダッシュボード**で、
             タブそのものを出さない。狭い画面の作りのまま横に引き伸ばすと、
             ワイドモニタで 1 枚が間延びして**余白ばかりのページ**になっていた。

          ⚠️ **列幅は 5 : 7。** 右に時系列（月別）を置く。折れ線・積み上げ棒は
             横に長いほど読めるので、内訳系より広い列を与えている。
          ⚠️ **Grid の子には必ず `minW={0}`。** 付けないと Recharts の
             `ResponsiveContainer` が親幅を測れず、中身の幅まで膨らんで
             列からはみ出す（CLAUDE.md の「Grid / Flex 子要素のオーバーフロー」）。
        */}
        {isWide ? (
          <Grid templateColumns="minmax(0, 5fr) minmax(0, 7fr)" gap={5} alignItems="start">
            <GridItem minW={0}>{isMono ? machineChart : storeChart}</GridItem>
            <GridItem minW={0}>{monthlyChart}</GridItem>
            <GridItem minW={0}>{methodChart}</GridItem>
            {/* ⚠️ 経費を使わない組織では 3 枚。1 枚だけの行になるが、
                   空のカードを置くより無いほうが読みやすい */}
            {expensesEnabled && <GridItem minW={0}>{profitChart}</GridItem>}
          </Grid>
        ) : (
          <>
            <RevenueTabs tabs={tabs} value={activeTab} onChange={setTab} />
            <Box minW={0}>
              {activeTab === "store" && !isMono && storeChart}
              {activeTab === "machine" && isMono && machineChart}
              {activeTab === "method" && methodChart}
              {activeTab === "profit" && profitChart}
              {activeTab === "monthly" && monthlyChart}
            </Box>
          </>
        )}

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
                  {/* ⚠️ 直接 Link にしない。支払方法がある店舗では何を集金するか聞く */}
                  <CollectStartButton store={coinLaundry}>
                    <Button
                      w="full"
                      size="md"
                      colorPalette="cyan"
                      borderRadius="full"
                      fontWeight="semibold"
                    >
                      <LuPlus /> 新規集金を記録
                    </Button>
                  </CollectStartButton>
                </Box>
              )}

              <Stack>
                {valiant === "aStore" && (
                  <CoinMonoDataTable id={coinLaundry.id} myRole={myRole} />
                )}
                {valiant === "manyStore" && <CoinManyDataTable />}

                {/* ⚠️ 「さらに表示」は表の中に移した（残りの件数／月数が要るため） */}

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
