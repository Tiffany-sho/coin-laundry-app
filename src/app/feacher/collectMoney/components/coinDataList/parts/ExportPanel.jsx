"use client";

import { useState } from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";

function dateToEpoch(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").getTime();
}

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
  const [method, setMethod] = useState("period");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stores, setStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState(storeId ? [storeId] : []);
  const [storesLoaded, setStoresLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPro = plan === "pro" || plan === "max";

  const handleMethodChange = async (newMethod) => {
    setMethod(newMethod);
    if (newMethod === "store" && !storesLoaded) {
      const { data } = await getStores();
      if (data) {
        setStores(data);
        setStoresLoaded(true);
      }
    }
  };

  const toggleStore = (id) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDownload = async () => {
    if (!isPro) return;
    setLoading(true);
    try {
      const body =
        method === "period"
          ? {
              startEpoch: dateToEpoch(startDate),
              endEpoch: dateToEpoch(endDate),
              storeIds: null,
            }
          : {
              startEpoch: null,
              endEpoch: null,
              storeIds: selectedStoreIds.length > 0 ? selectedStoreIds : null,
            };

      const res = await fetch("/api/export/collect-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      bg="var(--card-bg, #FFFFFF)"
      border="1px solid"
      borderColor="cyan.100"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      p={{ base: 4, md: 6 }}
    >
      <VStack align="stretch" gap={4}>
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

        <HStack gap={2}>
          <Button
            size="sm"
            variant={method === "period" ? "solid" : "outline"}
            colorPalette="cyan"
            borderRadius="full"
            onClick={() => handleMethodChange("period")}
          >
            期間別
          </Button>
          <Button
            size="sm"
            variant={method === "store" ? "solid" : "outline"}
            colorPalette="cyan"
            borderRadius="full"
            onClick={() => handleMethodChange("store")}
          >
            店舗別
          </Button>
        </HStack>

        {method === "period" && (
          <HStack gap={4} wrap="wrap">
            <Box>
              <Text fontSize="xs" color="var(--text-muted)" mb={1}>
                開始日
              </Text>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={dateInputStyle}
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="var(--text-muted)" mb={1}>
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
        )}

        {method === "store" && (
          <Box>
            <Text fontSize="xs" color="var(--text-muted)" mb={2}>
              店舗を選択（複数可）
            </Text>
            {!storesLoaded ? (
              <Text fontSize="sm" color="var(--text-faint)">
                読み込み中...
              </Text>
            ) : stores.length === 0 ? (
              <Text fontSize="sm" color="var(--text-faint)">
                店舗がありません
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
        )}

        <HStack justify="flex-end">
          {isPro ? (
            <Tooltip content="CSVをダウンロード">
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
