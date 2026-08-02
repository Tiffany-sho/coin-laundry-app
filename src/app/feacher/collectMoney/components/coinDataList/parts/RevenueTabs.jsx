"use client";

import { Box, HStack } from "@chakra-ui/react";

/**
 * 収益ページのグラフ切り替え。iOS の SegmentedTabs に合わせてある。
 *
 * ⚠️ **PC でも 1 枚ずつ出す。** 以前は 2 列に並べて 3 枚同時に見せていたが、
 *    アプリと見た目が揃わず、どちらを直したのか分からなくなっていた（2026-08-02 の決定）。
 *
 * ⚠️ タブの中身は**マウントしたまま隠さず、選ばれたものだけ描く。** 隠すだけだと
 *    Recharts の ResponsiveContainer が幅 0 を測ってしまい、表示に戻したとき
 *    グラフが潰れる（親の幅が確定していないと誤計算する）。
 */
const RevenueTabs = ({ tabs, value, onChange }) => (
  <HStack
    gap={1}
    p={1}
    bg="var(--app-bg, #F0F9FF)"
    borderRadius="full"
    border="1px solid"
    borderColor="cyan.100"
    overflowX="auto"
    css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
  >
    {tabs.map((tab) => {
      const active = tab.value === value;
      return (
        <Box
          key={tab.value}
          as="button"
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={active}
          flex="1"
          minW="fit-content"
          whiteSpace="nowrap"
          px={{ base: 3, md: 5 }}
          py={2}
          borderRadius="full"
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="semibold"
          cursor="pointer"
          transition="all 0.2s"
          bg={active ? "var(--card-bg, #FFFFFF)" : "transparent"}
          color={active ? "var(--teal-deeper)" : "var(--text-muted)"}
          boxShadow={active ? "var(--shadow-sm)" : "none"}
          _hover={active ? {} : { color: "var(--text-main)" }}
        >
          {tab.label}
        </Box>
      );
    })}
  </HStack>
);

export default RevenueTabs;
