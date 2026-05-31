"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  HStack,
  VStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { createNowData } from "@/functions/makeDate/date";

function epochToLabel(epoch) {
  if (epoch === null || epoch === undefined) return "現在まで";
  return createNowData(epoch);
}

export default function ExportCsvButton({ plan = "free" }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <Tooltip content="ProプランにアップグレードするとCSVエクスポートが利用できます">
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          borderRadius="full"
          disabled
          opacity={0.5}
          cursor="not-allowed"
        >
          <Icon.LuFileText />
          CSV
        </Button>
      </Tooltip>
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Dialog.Trigger asChild>
        <Button
          size="sm"
          variant="outline"
          colorPalette="cyan"
          borderRadius="full"
        >
          <Icon.LuFileText />
          CSV
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="20px"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
            maxW="400px"
            w="calc(100vw - 32px)"
          >
            <Dialog.Header
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              color="white"
              py={4}
              px={5}
              borderRadius="20px 20px 0 0"
            >
              <HStack gap={2}>
                <Icon.LuFileText size={18} />
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  CSVエクスポートの確認
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body p={5}>
              <VStack align="stretch" gap={3}>
                <Text fontSize="sm" color="var(--text-muted, #64748B)">
                  以下の条件でエクスポートします。
                </Text>
                <Box
                  p={4}
                  bg="var(--app-bg, #F0F9FF)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="cyan.100"
                >
                  <VStack align="stretch" gap={2}>
                    <HStack gap={2}>
                      <Box color="var(--teal, #0891B2)">
                        <Icon.LuCalendar size={14} />
                      </Box>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="var(--text-muted, #64748B)"
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        対象期間
                      </Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="bold" color="var(--text-main, #1E3A5F)" pl={5}>
                      {epochToLabel(startEpoch)} 〜 {epochToLabel(endEpoch)}
                    </Text>
                  </VStack>
                </Box>
                <Text fontSize="xs" color="var(--text-faint, #94A3B8)">
                  ※ 期間は画面上の絞り込みと連動しています
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              py={4}
              px={5}
              bg="var(--app-bg, #F0F9FF)"
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              gap={3}
              justifyContent="flex-end"
              borderRadius="0 0 20px 20px"
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  bg="var(--card-bg, #FFFFFF)"
                  color="var(--text-muted, #64748B)"
                  borderRadius="lg"
                  fontWeight="semibold"
                  px={5}
                  disabled={loading}
                  _hover={{ bg: "gray.50", borderColor: "cyan.200" }}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleDownload}
                fontWeight="semibold"
                borderRadius="lg"
                px={6}
                color="white"
                style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                transition="all 0.2s"
                loading={loading}
                loadingText="出力中..."
              >
                ダウンロード
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                color="white"
                disabled={loading}
                _hover={{ bg: "whiteAlpha.300" }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
