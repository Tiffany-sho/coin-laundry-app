"use client";

import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";

// ── CSV generation (client-side) ──────────────────────────────────────────────

const BOM = "﻿";
const CSV_HEADER = "日付,店舗名,設備名,合計,集金担当者\n";
const EPOCH_OFFSET = 32400000; // JST +9h in ms

function epochToDateStr(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
}

function epochToYearMonth(epoch) {
  const d = new Date(epoch + EPOCH_OFFSET);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return { key: `${y}-${String(m).padStart(2, "0")}`, label: `${y}年${m}月` };
}

function dateToEpoch(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").getTime();
}

function recordsToCsv(records) {
  const rows = records
    .flatMap((row) => {
      const date = epochToDateStr(row.date);
      const store = `${row.laundryName}店`;
      const total = row.totalFunds ?? 0;
      const collector = row.profiles?.username ?? "";
      const machines = Array.isArray(row.fundsArray) ? row.fundsArray : [];
      if (machines.length === 0) {
        return [`${date},${store},,,${total},${collector}`];
      }
      return machines.map((m) => `${date},${store},${m.name ?? ""},${total},${collector}`);
    })
    .join("\n");
  return BOM + CSV_HEADER + rows;
}

async function downloadFiles(files) {
  for (let i = 0; i < files.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 400));
    const blob = new Blob([files[i].csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = files[i].name;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const dateInputStyle = {
  border: "1px solid #CBD5E1",
  borderRadius: "8px",
  padding: "6px 10px",
  fontSize: "13px",
  color: "#1E3A5F",
  background: "#ffffff",
  outline: "none",
};

export default function ExportPanel({ plan = "free", storeId = null }) {
  const [splitMethod, setSplitMethod] = useState("period"); // "period" | "store"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stores, setStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const isPro = plan === "pro" || plan === "max";

  useEffect(() => {
    getStores().then(({ data }) => {
      if (!data) return;
      setStores(data);
      setSelectedStoreIds(storeId ? [storeId] : data.map((s) => s.id));
    });
  }, [storeId]);

  const toggleStore = (id) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = stores.length > 0 && selectedStoreIds.length === stores.length;

  const handleDownload = async () => {
    if (!isPro) return;
    setLoading(true);
    try {
      const res = await fetch("/api/export/collect-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startEpoch: dateToEpoch(startDate),
          endEpoch: dateToEpoch(endDate),
          storeIds: selectedStoreIds.length > 0 ? selectedStoreIds : null,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(`エラー: ${error ?? "エクスポートに失敗しました"}`);
        return;
      }
      const { data } = await res.json();

      if (!data || data.length === 0) {
        alert("ダウンロードするデータがありません");
        return;
      }

      const now = new Date();
      const dateSuffix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

      let files = [];

      if (splitMethod === "store") {
        // 店舗ごとにファイル分割
        const groups = {};
        data.forEach((row) => {
          const key = row.laundryName;
          if (!groups[key]) groups[key] = [];
          groups[key].push(row);
        });
        files = Object.entries(groups).map(([name, records]) => ({
          name: `collecie_${name}店_${dateSuffix}.csv`,
          csv: recordsToCsv(records),
        }));
      } else {
        // 月ごとにファイル分割
        const groups = {};
        data.forEach((row) => {
          const { key, label } = epochToYearMonth(row.date);
          if (!groups[key]) groups[key] = { label, records: [] };
          groups[key].records.push(row);
        });
        files = Object.entries(groups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, { label, records }]) => ({
            name: `collecie_${label}_${dateSuffix}.csv`,
            csv: recordsToCsv(records),
          }));
      }

      await downloadFiles(files);
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      p={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" gap={5}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack gap={2}>
            <Box color="var(--teal)">
              <Icon.LuFileText size={15} />
            </Box>
            <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
              CSVエクスポート
            </Text>
          </HStack>
          {!isPro && (
            <Text fontSize="xs" color="var(--text-muted)">
              Proプラン以上で利用可能
            </Text>
          )}
        </HStack>

        {/* Period filter */}
        <Box>
          <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={2}>
            期間
          </Text>
          <HStack gap={2} wrap="wrap" align="flex-end">
            <Box>
              <Text fontSize="xs" color="var(--text-faint)" mb={1}>
                開始日
              </Text>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={dateInputStyle}
              />
            </Box>
            <Text fontSize="sm" color="var(--text-faint)" pb={1}>
              〜
            </Text>
            <Box>
              <Text fontSize="xs" color="var(--text-faint)" mb={1}>
                終了日
              </Text>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={dateInputStyle}
              />
            </Box>
          </HStack>
        </Box>

        {/* Store filter */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold">
              店舗
            </Text>
            {stores.length > 1 && (
              <Box
                as="button"
                fontSize="xs"
                color="var(--teal)"
                cursor="pointer"
                onClick={() =>
                  allSelected
                    ? setSelectedStoreIds([])
                    : setSelectedStoreIds(stores.map((s) => s.id))
                }
              >
                {allSelected ? "全解除" : "全選択"}
              </Box>
            )}
          </HStack>
          {stores.length === 0 ? (
            <Text fontSize="sm" color="var(--text-faint)">
              読み込み中...
            </Text>
          ) : (
            <HStack wrap="wrap" gap={2}>
              {stores.map((store) => {
                const selected = selectedStoreIds.includes(store.id);
                return (
                  <Box
                    key={store.id}
                    as="button"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    border="1px solid"
                    borderColor={selected ? "cyan.400" : "gray.200"}
                    bg={selected ? "cyan.50" : "white"}
                    color={selected ? "var(--teal)" : "var(--text-muted)"}
                    fontSize="sm"
                    fontWeight={selected ? "semibold" : "normal"}
                    onClick={() => toggleStore(store.id)}
                    transition="all 0.15s"
                    cursor="pointer"
                    _hover={{ borderColor: "cyan.300" }}
                  >
                    {store.store}店
                  </Box>
                );
              })}
            </HStack>
          )}
        </Box>

        {/* Split method */}
        <Box>
          <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={2}>
            ファイル分割
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant={splitMethod === "period" ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setSplitMethod("period")}
            >
              月ごと
            </Button>
            <Button
              size="sm"
              variant={splitMethod === "store" ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setSplitMethod("store")}
            >
              店舗ごと
            </Button>
          </HStack>
        </Box>

        {/* Download */}
        <HStack justify="flex-end">
          {isPro ? (
            <Tooltip content={`${splitMethod === "period" ? "月ごと" : "店舗ごと"}にCSVをダウンロード`}>
              <Button
                size="sm"
                colorPalette="cyan"
                borderRadius="full"
                onClick={handleDownload}
                loading={loading}
              >
                <Icon.LuDownload />
                ダウンロード
              </Button>
            </Tooltip>
          ) : (
            <Tooltip content="ProプランにアップグレードするとCSVエクスポートが利用できます">
              <Button
                size="sm"
                colorPalette="gray"
                borderRadius="full"
                disabled
                opacity={0.4}
              >
                <Icon.LuDownload />
                ダウンロード
              </Button>
            </Tooltip>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
