"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import RevenueTabs from "@/app/feacher/collectMoney/components/coinDataList/parts/RevenueTabs";
import InventoryClientPage from "@/app/feacher/inventory/InventoryClientPage";
import EquipmentClientPage from "@/app/feacher/equipment/EquipmentClientPage";

/**
 * 管理（在庫 / 設備）。**1 枚に統合した**（2026-08-05）。
 *
 * ⚠️ **もとは `/inventory` と `/equipment` の 2 ページで、互いへのリンクで
 *    行き来していた。** フッターナビは両方を「管理」1 つとして扱っていたので、
 *    **押すたびに在庫へ戻り、設備を見るには毎回リンクを踏み直す**必要があった。
 *    アプリは最初から 1 画面 + 切り替えなので、そちらに合わせてある。
 *
 * ⚠️ **切り替えは `RevenueTabs`**（アプリの `SegmentedTabs` に合わせた既存の部品）。
 *    ここに 2 つ目の切り替え部品を作らないこと。
 *
 * ⚠️ **どちらを開くかは `?tab=` で受ける。** ホームの「在庫状況 / 設備状況」から
 *    名指しで開けるようにするため。⚠️ **URL は書き換えない**（`replace` すると
 *    戻る操作が切り替えの回数だけ増える）。
 *
 * ⚠️ **在庫と設備は別のクエリ**（`getStockStates` / `getMachinesStates`）。
 *    サーバ側で両方引いて渡している。片方だけにすると、切り替えた瞬間に
 *    空のカードが出てから中身が入る。
 */
export default function ManageClientPage({ stocks, storeStates, canEdit }) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("tab") === "equipment" ? "equipment" : "stock";
  const [tab, setTab] = useState(initial);

  const lowStockCount = stocks.filter((s) => {
    const t = s.stock_thresholds ?? {};
    return (
      s.detergent <= (t.detergent ?? 1) ||
      s.softener <= (t.softener ?? 1) ||
      (s.extra_stocks ?? []).some((e) => e.count <= (e.threshold ?? 1))
    );
  }).length;

  const brokenCount = storeStates.reduce(
    (acc, s) => acc + (s.machines?.filter((m) => m.break).length ?? 0),
    0
  );

  /*
    ⚠️ **幅の上限はここ 1 か所だけで決める。** 中の
       `InventoryClientPage` / `EquipmentClientPage` は `embedded` のとき
       自分では `maxW` を持たない。**両方が持つと狭いほうが勝つ**ので、
       ここだけ広げても**カードの幅は 1px も変わらない**（実際にそうなっていた）。
    ⚠️ 900px は在庫カードの中身（警告ラインの行が横に長い）に合わせた値。
       ⚠️ **`100%` にしないこと。** ワイドモニタで 1 行が伸びきり、
          店舗名と個数が画面の端と端に離れて対応が読めなくなる。
  */
  return (
    <VStack align="stretch" gap={5} maxW="900px" mx="auto">
      <HStack gap={3}>
        <Box
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          color="white"
          borderRadius="xl"
          p={2.5}
        >
          <Icon.LuPackage size={22} />
        </Box>
        <VStack align="start" gap={0}>
          <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
            管理
          </Heading>
          <Text fontSize="xs" color="var(--text-muted)">全店舗の在庫と機器の状態</Text>
        </VStack>
      </HStack>

      {/*
        ⚠️ **件数をラベルに出す。** 切り替えの向こう側に要対応が残っているとき、
           開かないと気づけない状態にしない（アプリはホームの
           「今日の対応状況」がその役目を持っている）。
      */}
      <RevenueTabs
        tabs={[
          { value: "stock", label: lowStockCount > 0 ? `在庫（${lowStockCount}）` : "在庫" },
          { value: "equipment", label: brokenCount > 0 ? `設備（${brokenCount}）` : "設備" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/*
        ⚠️ **選ばれたほうだけ描く。** 隠すだけにすると、カード内のダイアログが
           見えないところで開きっぱなしになる。
      */}
      {tab === "stock" ? (
        <InventoryClientPage stocks={stocks} canEdit={canEdit} embedded />
      ) : (
        <EquipmentClientPage storeStates={storeStates} canEdit={canEdit} embedded />
      )}
    </VStack>
  );
}
