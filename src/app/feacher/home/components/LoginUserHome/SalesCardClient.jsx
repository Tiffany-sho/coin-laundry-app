"use client";

import { useState, useTransition, useRef } from "react";
import { Box, HStack, VStack, Text, Badge, Button, Spinner } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { getMonthFundsByOffset } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

// ──────── helpers ────────

const MONTH_BG = {
  1:  "blue.800",
  2:  "purple.600",
  3:  "pink.400",
  4:  "red.400",
  5:  "green.600",
  6:  "teal.500",
  7:  "cyan.600",
  8:  "orange.500",
  9:  "yellow.600",
  10: "orange.700",
  11: "red.700",
  12: "blue.600",
};

const getMonthBg = (monthOffset) => {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getMonth() + 1;
  return MONTH_BG[month];
};

const getMonthLabel = (offset) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${target.getFullYear()}年${target.getMonth() + 1}月`;
};

// ──────── FundsDisplay ────────

const FundsDisplay = ({ data, error }) => {
  if (error) {
    return (
      <Box py={4}>
        <Text color="white" fontSize="sm">データ取得失敗</Text>
      </Box>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Box py={4}>
        <Text fontSize={{ base: "3xl", md: "5xl" }} fontWeight="extrabold" color="white">¥0</Text>
        <Text fontSize="xs" color="whiteAlpha.700" mt={2}>この月の集金記録はありません</Text>
      </Box>
    );
  }
  const totalRevenue = data.reduce((acc, cur) => acc + cur.totalFunds, 0);
  const collectCount = data.length;
  return (
    <Box py={2}>
      <HStack align="baseline" gap={2} flexWrap="wrap">
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white">¥</Text>
        <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="extrabold" color="white" lineHeight="1">
          {totalRevenue.toLocaleString()}
        </Text>
      </HStack>
      <HStack gap={4} mt={3} flexWrap="wrap">
        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>集金回数</Text>
          <Text fontSize="lg" fontWeight="bold" color="white">{collectCount}回</Text>
        </Box>
        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>平均単価</Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            ¥{Math.round(totalRevenue / collectCount).toLocaleString()}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

// ──────── AdjacentCard ────────

const AdjacentCard = ({ monthOffset }) => {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).getMonth() + 1;
  return (
    <Box
      bg={getMonthBg(monthOffset)}
      borderRadius="xl"
      h="100%"
      minH="180px"
      opacity={0.5}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text color="white" fontWeight="bold" fontSize="sm" style={{ writingMode: "vertical-rl" }}>
        {month}月
      </Text>
    </Box>
  );
};

const FuturePlaceholder = () => (
  <Box bg="gray.300" borderRadius="xl" h="100%" minH="180px" opacity={0.3} />
);

// ──────── ActiveCard ────────

const ActiveCard = ({ monthOffset, data, error, isPending, navigate }) => {
  const isCurrentMonth = monthOffset === 0;
  const monthLabel = getMonthLabel(monthOffset);
  const monthBg = getMonthBg(monthOffset);

  return (
    <Box
      bg={monthBg}
      transition="background 0.4s"
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top="-20%" right="-10%" w="200px" h="200px" bg="white" opacity={0.05} borderRadius="full" />
      <Box position="absolute" bottom="-30%" left="-5%" w="150px" h="150px" bg="white" opacity={0.05} borderRadius="full" />

      <VStack align="stretch" gap={3} position="relative">
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon.LuTrendingUp color="white" size={24} />
            <Text fontSize={{ base: "sm", md: "md" }} color="white" fontWeight="semibold">
              {isCurrentMonth ? "今月の売上" : "売上"}
            </Text>
          </HStack>
          <Badge bg="whiteAlpha.300" color="white" fontSize="xs" px={2} py={1} borderRadius="full">
            {monthLabel}
          </Badge>
        </HStack>

        <Box position="relative">
          <Box opacity={isPending ? 0.3 : 1} transition="opacity 0.15s">
            <FundsDisplay data={data} error={error} />
          </Box>
          {isPending && (
            <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
              <Spinner color="white" size="lg" />
            </Box>
          )}
        </Box>

        <HStack justify="space-between" mt={1} display={{ base: "none", md: "flex" }}>
          <Button
            size="xs" variant="ghost" color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => navigate(monthOffset - 1)}
            disabled={isPending}
          >
            <Icon.LuChevronLeft size={14} />
            先月を見る
          </Button>
          {!isCurrentMonth && (
            <Button
              size="xs" variant="ghost" color="white"
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

// ──────── SalesCardClient ────────

// トラックの初期 transform（カード幅 = 100%-48px、peek=24px、gap=8px のとき中央カードを表示）
// translateX = peek - (cardW + gap) = 24 - (W-48+8) = 64 - W = calc(64px - 100%)
const BASE_TRANSFORM = "translateX(calc(64px - 100%))";

const SalesCardClient = ({ id, initialData, initialError }) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [fundsData, setFundsData] = useState(initialData);
  const [fundsError, setFundsError] = useState(initialError);
  const [isPending, startTransition] = useTransition();

  // トラックのスタイルを state で管理（transform + transition をまとめて更新）
  const [trackStyle, setTrackStyle] = useState({
    transform: BASE_TRANSFORM,
    transition: "none",
  });

  const touchStartX = useRef(null);
  const containerRef = useRef(null);
  const animatingRef = useRef(false); // 多重発火防止

  const getSlideAmount = () => {
    const W = containerRef.current?.offsetWidth ?? 375;
    return W - 48 + 8; // cardWidth(W-48) + gap(8)
  };

  const updateTrack = (xOffset, withTransition) => {
    setTrackStyle({
      transform: `translateX(calc(64px - 100% + ${xOffset}px))`,
      transition: withTransition ? "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
    });
  };

  const fetchAndUpdate = (newOffset) => {
    setMonthOffset(newOffset);
    startTransition(async () => {
      const { data, error } = await getMonthFundsByOffset(id, newOffset);
      setFundsData(data ?? null);
      setFundsError(error ?? null);
    });
  };

  // スライドアニメーション → テレポートリセット → 月更新
  const slideAndNavigate = (newOffset) => {
    if (animatingRef.current || isPending) return;
    if (newOffset > 0) return;

    animatingRef.current = true;

    // 先月へ → トラックを右へ(+)、翌月へ → トラックを左へ(-)
    const slideX = newOffset < monthOffset ? getSlideAmount() : -getSlideAmount();

    // 1) スライドアニメーション開始
    updateTrack(slideX, true);

    setTimeout(() => {
      // 2) トランジションなしで中央にリセット（テレポート）
      setTrackStyle({ transform: BASE_TRANSFORM, transition: "none" });

      // 3) 月データ更新
      fetchAndUpdate(newOffset);

      // 4) 次フレームでトランジションを再有効化
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animatingRef.current = false;
        });
      });
    }, 340);
  };

  // ── タッチハンドラー ──

  const handleTouchStart = (e) => {
    if (animatingRef.current || isPending) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null || animatingRef.current) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    const slideAmount = getSlideAmount();
    // 端に近づくほど動きを重くする（ゴム感）
    const resistance = 0.35;
    const clamped =
      delta > 0
        ? Math.min(slideAmount, delta * (isAtStart ? resistance : 1))
        : Math.max(-slideAmount, delta * (monthOffset < 0 ? 1 : resistance));
    updateTrack(clamped, false);
  };

  const isAtStart = monthOffset === 0; // 現在月（左スワイプに抵抗）

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (deltaX > 50) {
      // 右スワイプ → 先月
      slideAndNavigate(monthOffset - 1);
    } else if (deltaX < -50 && monthOffset < 0) {
      // 左スワイプ → 翌月
      slideAndNavigate(monthOffset + 1);
    } else {
      // 閾値未満 → 中央に戻す
      updateTrack(0, true);
    }
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    if (!animatingRef.current) updateTrack(0, true);
  };

  const isCurrentMonth = monthOffset === 0;

  return (
    <>
      {/* ── モバイル: スライドカルーセル ── */}
      <Box
        ref={containerRef}
        display={{ base: "block", md: "none" }}
        overflow="hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, calc(100% - 48px))"
          gap="8px"
          style={trackStyle}
        >
          <AdjacentCard monthOffset={monthOffset - 1} />
          <ActiveCard
            monthOffset={monthOffset}
            data={fundsData}
            error={fundsError}
            isPending={isPending}
            navigate={slideAndNavigate}
          />
          {isCurrentMonth
            ? <FuturePlaceholder />
            : <AdjacentCard monthOffset={monthOffset + 1} />
          }
        </Box>
      </Box>

      {/* ── デスクトップ: 通常表示 ── */}
      <Box display={{ base: "none", md: "block" }}>
        <ActiveCard
          monthOffset={monthOffset}
          data={fundsData}
          error={fundsError}
          isPending={isPending}
          navigate={slideAndNavigate}
        />
      </Box>
    </>
  );
};

export default SalesCardClient;
