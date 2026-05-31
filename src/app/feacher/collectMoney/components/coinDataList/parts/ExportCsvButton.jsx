"use client";

import { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Popover,
  Portal,
  Separator,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { createNowData } from "@/functions/makeDate/date";

function epochToLabel(epoch) {
  if (epoch === null || epoch === undefined) return "現在まで";
  return createNowData(epoch);
}

function FilterRow({ icon, label, value }) {
  return (
    <HStack gap={3} align="center">
      <Box color="var(--teal, #0891B2)" flexShrink={0}>
        {icon}
      </Box>
      <Text fontSize="xs" color="var(--text-muted, #64748B)" flexShrink={0}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
        {value}
      </Text>
    </HStack>
  );
}

export default function ExportCsvButton({ plan = "free" }) {
  const [loading, setLoading] = useState(false);
  const { startEpoch, endEpoch } = useUploadPage();
  const isPro = plan === "pro" || plan === "max";

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/collect-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startEpoch, endEpoch }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(`エラー: ${error ?? "エクスポートに失敗しました"}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      a.href = url;
      a.download = `collecie_${y}${m}${d}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <Tooltip content="ProプランにアップグレードするとCSVエクスポートが利用できます">
        <IconButton
          size="sm"
          variant="outline"
          colorPalette="gray"
          borderRadius="full"
          disabled
          opacity={0.5}
          aria-label="CSVエクスポート"
        >
          <Icon.LuFileText />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Popover.Root modal={false}>
      <Popover.Trigger asChild>
        <IconButton
          size="sm"
          variant="outline"
          colorPalette="cyan"
          borderRadius="full"
          aria-label="CSVエクスポート"
        >
          <Icon.LuFileText />
        </IconButton>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="xl"
            boxShadow="var(--shadow-hero)"
            border="1px solid"
            borderColor="cyan.100"
            w="260px"
            p={0}
            overflow="hidden"
          >
            {/* ヘッダー */}
            <Box
              px={4}
              py={3}
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            >
              <HStack justify="space-between" align="center">
                <HStack gap={2} color="white">
                  <Icon.LuFileText size={14} />
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    CSVエクスポート
                  </Text>
                </HStack>
                <Popover.CloseTrigger asChild>
                  <Box color="white" cursor="pointer" opacity={0.8} _hover={{ opacity: 1 }} fontSize="lg" lineHeight={1}>
                    ×
                  </Box>
                </Popover.CloseTrigger>
              </HStack>
            </Box>

            {/* フィルター条件 */}
            <VStack align="stretch" gap={3} px={4} py={4}>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted, #64748B)" textTransform="uppercase" letterSpacing="wide">
                絞り込み条件
              </Text>
              <Box
                p={3}
                bg="var(--app-bg, #F0F9FF)"
                borderRadius="lg"
                border="1px solid"
                borderColor="cyan.100"
              >
                <FilterRow
                  icon={<Icon.LuCalendar size={13} />}
                  label="期間"
                  value={`${epochToLabel(startEpoch)} 〜 ${epochToLabel(endEpoch)}`}
                />
              </Box>

              <Separator borderColor="var(--divider, #F1F5F9)" />

              {/* ダウンロードボタン */}
              <HStack justify="flex-end">
                <Tooltip content="CSVをダウンロード">
                  <IconButton
                    size="md"
                    colorPalette="cyan"
                    borderRadius="full"
                    onClick={handleDownload}
                    loading={loading}
                    aria-label="CSVをダウンロード"
                    boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                    transition="all 0.2s"
                  >
                    <Icon.LuDownload />
                  </IconButton>
                </Tooltip>
              </HStack>
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
