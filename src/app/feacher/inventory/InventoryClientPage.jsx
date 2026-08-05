"use client";
import { Box, VStack, HStack, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import InventoryStoreCard from "./InventoryStoreCard";

/**
 * ⚠️ **`embedded` は「管理」ページの中に置かれているという意味**（2026-08-05）。
 *    そのとき見出しと「設備管理へ」のリンクを出さない。親（`ManageClientPage`）が
 *    見出しと切り替えを持っているので、出すと**同じ画面に見出しが 2 つ並び、
 *    リンクを踏んでも同じページに留まる。**
 * ⚠️ `/inventory` を直接開いた場合は `embedded` が付かないので従来どおり出る…
 *    という作りにはしていない（あちらはリダイレクトで `/inventory` へ集約した）。
 *    ⚠️ **単体で使う経路を復活させるなら、リンク先も一緒に見直すこと。**
 */
export default function InventoryClientPage({ stocks, canEdit, embedded = false }) {
  const lowStockCount = stocks.filter((s) => {
    const t = s.stock_thresholds ?? {};
    return (
      s.detergent <= (t.detergent ?? 1) ||
      s.softener <= (t.softener ?? 1) ||
      (s.extra_stocks ?? []).some((e) => e.count <= (e.threshold ?? 1))
    );
  }).length;

  return (
    <VStack
      align="stretch"
      gap={5}
      /* ⚠️ **埋め込まれているときは幅を持たない。** 親（ManageClientPage）が
            上限を決めている。ここでも持つと**狭いほうが勝ち**、親を広げても
            カードの幅が変わらない */
      maxW={embedded ? undefined : "600px"}
      mx={embedded ? undefined : "auto"}
    >
      {!embedded && (
        <HStack justify="space-between" align="center">
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
              <Heading
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="var(--teal-deeper)"
              >
                在庫管理
              </Heading>
              <Text fontSize="xs" color="var(--text-muted)">全店舗の在庫状況</Text>
            </VStack>
          </HStack>
        </HStack>
      )}

      {lowStockCount > 0 ? (
        <Box
          bg="orange.50"
          border="1px solid"
          borderColor="orange.200"
          borderRadius="xl"
          p={4}
        >
          <HStack gap={3}>
            <Icon.CiCircleAlert size={20} color="#ea580c" />
            <Text color="orange.700" fontWeight="bold" fontSize="sm">
              {lowStockCount}店舗で在庫不足です。補充をご確認ください。
            </Text>
          </HStack>
        </Box>
      ) : stocks.length > 0 ? (
        <Box
          bg="cyan.50"
          border="1px solid"
          borderColor="cyan.200"
          borderRadius="xl"
          p={4}
        >
          <HStack gap={3}>
            <Icon.LuCheck size={20} color="#0891B2" />
            <Text color="cyan.700" fontWeight="bold" fontSize="sm">
              全店舗の在庫は問題ありません
            </Text>
          </HStack>
        </Box>
      ) : null}

      <Box
        bg="var(--card-bg, #FFFFFF)"
        borderRadius="xl"
        boxShadow="var(--shadow-sm)"
        border="1px solid"
        borderColor="cyan.100"
        p={4}
      >
        <VStack align="stretch" gap={3}>
          {stocks.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Icon.LuPackage size={32} color="#94A3B8" style={{ margin: "0 auto 8px" }} />
              <Text color="var(--text-muted)" fontSize="sm">登録された店舗がありません</Text>
            </Box>
          ) : (
            stocks.map((stock) => (
              <InventoryStoreCard key={stock.laundryId} stock={stock} canEdit={canEdit} />
            ))
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
