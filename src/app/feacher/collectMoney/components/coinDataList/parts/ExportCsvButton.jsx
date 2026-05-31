"use client";

import { useState } from "react";
import { Box, HStack, Text, IconButton } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { createNowData } from "@/functions/makeDate/date";

function epochToLabel(epoch) {
  if (epoch === null || epoch === undefined) return "現在まで";
  return createNowData(epoch);
}

export default function ExportCsvButton({ plan = "free", storeName = "全店舗" }) {
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

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={2}
      px={3}
      py={1.5}
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="full"
      boxShadow="var(--shadow-sm)"
    >
      <Box color="var(--teal, #0891B2)" display="flex">
        <Icon.LuFileText size={13} />
      </Box>
      <Box>
        <Text fontSize="xs" color="var(--text-muted, #64748B)" whiteSpace="nowrap">
          {storeName}
        </Text>
        <Text fontSize="xs" color="var(--text-muted, #64748B)" whiteSpace="nowrap">
          {epochToLabel(startEpoch)} 〜 {epochToLabel(endEpoch)}
        </Text>
      </Box>
      {isPro ? (
        <Tooltip content="CSVをダウンロード">
          <IconButton
            size="2xs"
            colorPalette="cyan"
            borderRadius="full"
            onClick={handleDownload}
            loading={loading}
            aria-label="CSVをダウンロード"
          >
            <Icon.LuDownload />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip content="ProプランにアップグレードするとCSVエクスポートが利用できます">
          <IconButton
            size="2xs"
            colorPalette="gray"
            borderRadius="full"
            disabled
            opacity={0.4}
            aria-label="CSVエクスポート（Pro限定）"
          >
            <Icon.LuDownload />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
