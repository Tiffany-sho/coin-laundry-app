"use client";

import { useState, useTransition, useRef } from "react";
import { Box, HStack, VStack, Text, Badge, Button, Spinner } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { getMonthFundsByOffset } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const getMonthLabel = (offset) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${target.getFullYear()}年${target.getMonth() + 1}月`;
};

// 月ごとの背景色トークン（Chakra UIカラートークン直接指定）
const MONTH_BG = {
  1:  "blue.800",    // 1月: 冬の深夜空
  2:  "purple.600",  // 2月: バレンタイン・梅
  3:  "pink.400",    // 3月: 桃の花・ひな祭り
  4:  "red.400",     // 4月: 桜
  5:  "green.600",   // 5月: 新緑
  6:  "teal.500",    // 6月: 梅雨・紫陽花
  7:  "cyan.600",    // 7月: 夏の海
  8:  "orange.500",  // 8月: ひまわり・夏祭り
  9:  "yellow.600",  // 9月: 稲穂・十五夜
  10: "orange.700",  // 10月: 紅葉
  11: "red.700",     // 11月: 深紅の紅葉
  12: "blue.600",    // 12月: 冬の空
};

const getMonthBg = (monthOffset) => {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getMonth() + 1;
  return MONTH_BG[month];
};

const FundsDisplay = ({ data, error }) => {
  if (error) {
    return (
      <Box py={4}>
        <Text color="white" fontSize="sm">
          データ取得失敗
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box py={4}>
        <Text fontSize={{ base: "3xl", md: "5xl" }} fontWeight="extrabold" color="white">
          ¥0
        </Text>
        <Text fontSize="xs" color="whiteAlpha.700" mt={2}>
          この月の集金記録はありません
        </Text>
      </Box>
    );
  }

  const totalRevenue = data.reduce((acc, cur) => acc + cur.totalFunds, 0);
  const collectCount = data.length;

  return (
    <Box py={2}>
      <HStack align="baseline" gap={2} flexWrap="wrap">
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white">
          ¥
        </Text>
        <Text
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="extrabold"
          color="white"
          lineHeight="1"
        >
          {totalRevenue.toLocaleString()}
        </Text>
      </HStack>

      <HStack gap={4} mt={3} flexWrap="wrap">
        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>
            集金回数
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {collectCount}回
          </Text>
        </Box>
        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>
            平均単価
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            ¥{Math.round(totalRevenue / collectCount).toLocaleString()}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

const SalesCardClient = ({ id, initialData, initialError }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [fundsData, setFundsData] = useState(initialData);
  const [fundsError, setFundsError] = useState(initialError);
  const [isPending, startTransition] = useTransition();
  const touchStartX = useRef(null);

  const navigate = (newOffset) => {
    startTransition(async () => {
      const { data, error } = await getMonthFundsByOffset(id, newOffset);
      setFundsData(data ?? null);
      setFundsError(error ?? null);
      setMonthOffset(newOffset);
    });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || isPending) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const THRESHOLD = 50;
    if (deltaX > THRESHOLD) {
      // 右スワイプ → 先月
      navigate(monthOffset - 1);
    } else if (deltaX < -THRESHOLD && !isCurrentMonth) {
      // 左スワイプ → 翌月（現在月より未来には進まない）
      navigate(monthOffset + 1);
    }
  };

  const isCurrentMonth = monthOffset === 0;
  const monthLabel = getMonthLabel(monthOffset);
  const monthBg = getMonthBg(monthOffset);

  return (
    <Box
      bg={monthBg}
      transition="background 0.4s"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      cursor={{ base: "grab", md: "default" }}
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="200px"
        h="200px"
        bg="white"
        opacity={0.05}
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-5%"
        w="150px"
        h="150px"
        bg="white"
        opacity={0.05}
        borderRadius="full"
      />

      <VStack align="stretch" gap={3} position="relative">
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon.LuTrendingUp color="white" size={24} />
            <Text fontSize={{ base: "sm", md: "md" }} color="white" fontWeight="semibold">
              {isCurrentMonth ? "今月の売上" : "売上"}
            </Text>
          </HStack>
          <Badge
            bg="whiteAlpha.300"
            color="white"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {monthLabel}
          </Badge>
        </HStack>

        <Box position="relative">
          <Box opacity={isPending ? 0.3 : 1} transition="opacity 0.15s">
            <FundsDisplay data={fundsData} error={fundsError} />
          </Box>
          {isPending && (
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner color="white" size="lg" />
            </Box>
          )}
        </Box>

        <HStack justify="space-between" mt={1}>
          <Button
            size="xs"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => navigate(monthOffset - 1)}
            disabled={isPending}
          >
            <Icon.LuChevronLeft size={14} />
            先月を見る
          </Button>
          {!isCurrentMonth && (
            <Button
              size="xs"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => navigate(monthOffset + 1)}
              disabled={isPending}
            >
              次の月
              <Icon.LuChevronRight size={14} />
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default SalesCardClient;
