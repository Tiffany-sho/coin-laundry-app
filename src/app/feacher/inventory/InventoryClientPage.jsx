"use client";
import { Box, VStack, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import InventoryStoreCard from "./InventoryStoreCard";

export default function InventoryClientPage({ stocks, canEdit }) {
  const lowStockCount = stocks.filter(
    (s) =>
      s.detergent < 2 ||
      s.softener < 2 ||
      (s.extra_stocks ?? []).some((e) => e.count < 2)
  ).length;

  return (
    <VStack align="stretch" gap={5} maxW="600px" mx="auto">
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
        <Link href="/equipment">
          <HStack gap={1} color="var(--teal)" fontSize="sm" fontWeight="semibold">
            <Text>設備管理</Text>
            <Icon.LuChevronRight size={16} />
          </HStack>
        </Link>
      </HStack>

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
