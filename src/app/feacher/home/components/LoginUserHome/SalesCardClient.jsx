"use client";

import { useState, useTransition } from "react";
import { Box, HStack, VStack, Text, Badge, Button, Spinner } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { getMonthFundsByOffset } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const getMonthLabel = (offset) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${target.getFullYear()}年${target.getMonth() + 1}月`;
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

  const navigate = (newOffset) => {
    startTransition(async () => {
      const { data, error } = await getMonthFundsByOffset(id, newOffset);
      setFundsData(data ?? null);
      setFundsError(error ?? null);
      setMonthOffset(newOffset);
    });
  };

  const isCurrentMonth = monthOffset === 0;
  const monthLabel = getMonthLabel(monthOffset);

  return (
    <Box
      colorPalette="blue"
      bg="colorPalette.600"
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

        {isPending ? (
          <Box py={6} display="flex" justifyContent="center">
            <Spinner color="white" size="lg" />
          </Box>
        ) : (
          <FundsDisplay data={fundsData} error={fundsError} />
        )}

        <HStack gap={2} mt={1} flexWrap="wrap">
          {!isCurrentMonth && (
            <Button
              size="xs"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => navigate(monthOffset + 1)}
              disabled={isPending}
            >
              <Icon.LuChevronLeft size={14} />
              次の月
            </Button>
          )}
          <Button
            size="xs"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => navigate(monthOffset - 1)}
            disabled={isPending}
            ml={isCurrentMonth ? "auto" : undefined}
          >
            先月を見る
            <Icon.LuChevronRight size={14} />
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SalesCardClient;
