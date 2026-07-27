"use client";

import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { buildCsvFiles } from "@/functions/csvExport";
import { dateToEpoch, defaultDateRange, formatDateSuffix } from "@/functions/exportData";

// ── download helpers (client-side) ────────────────────────────────────────────

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// CSV は分割数だけ連続ダウンロードするため、ブラウザに弾かれないよう間隔を空ける
async function downloadFiles(files) {
  for (let i = 0; i < files.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 400));
    saveBlob(new Blob([files[i].csv], { type: "text/csv;charset=utf-8" }), files[i].name);
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
  const [fileFormat, setFileFormat] = useState("csv"); // "csv" | "xlsx"
  const [splitMethod, setSplitMethod] = useState("period"); // "period" | "store"
  const { start: defaultStart, end: defaultEnd } = defaultDateRange();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
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
      const isXlsx = fileFormat === "xlsx";
      const body = JSON.stringify({
        startEpoch: dateToEpoch(startDate),
        endEpoch: dateToEpoch(endDate),
        storeIds: selectedStoreIds.length > 0 ? selectedStoreIds : null,
        ...(isXlsx ? { splitMethod } : {}),
      });

      const res = await fetch(
        isXlsx ? "/api/export/collect-xlsx" : "/api/export/collect-csv",
        { method: "POST", headers: { "Content-Type": "application/json" }, body }
      );
      if (!res.ok) {
        const { error } = await res.json();
        alert(`エラー: ${error ?? "エクスポートに失敗しました"}`);
        return;
      }

      // Excel はサーバーで1ブックに組み立て済みなので、そのまま保存する
      if (isXlsx) {
        saveBlob(await res.blob(), `collecie_${formatDateSuffix()}.xlsx`);
        return;
      }

      const { data } = await res.json();
      if (!data || data.length === 0) {
        alert("ダウンロードするデータがありません");
        return;
      }

      await downloadFiles(
        buildCsvFiles(data, { splitMethod, dateSuffix: formatDateSuffix() })
      );
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <VStack align="stretch" gap={5}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack gap={2}>
            <Box color="var(--teal)">
              <Icon.LuFileText size={15} />
            </Box>
            <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
              データエクスポート
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

        {/* File format */}
        <Box>
          <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={2}>
            ファイル形式
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant={fileFormat === "csv" ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setFileFormat("csv")}
            >
              CSV
            </Button>
            <Button
              size="sm"
              variant={fileFormat === "xlsx" ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setFileFormat("xlsx")}
            >
              Excel
            </Button>
          </HStack>
        </Box>

        {/* Split method */}
        <Box>
          <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={2}>
            {fileFormat === "xlsx" ? "シート分割" : "ファイル分割"}
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
          <Text fontSize="xs" color="var(--text-faint)" mt={2}>
            {fileFormat === "xlsx"
              ? `1つのExcelファイルにまとめ、${splitMethod === "period" ? "月" : "店舗"}ごとにシートを分けます`
              : `${splitMethod === "period" ? "月" : "店舗"}ごとに別々のCSVファイルをダウンロードします`}
          </Text>
        </Box>

        {/* Download */}
        <HStack justify="flex-end">
          {isPro ? (
            <Tooltip
              content={
                fileFormat === "xlsx"
                  ? `${splitMethod === "period" ? "月" : "店舗"}ごとのシートを含むExcelファイルをダウンロード`
                  : `${splitMethod === "period" ? "月ごと" : "店舗ごと"}にCSVをダウンロード`
              }
            >
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
