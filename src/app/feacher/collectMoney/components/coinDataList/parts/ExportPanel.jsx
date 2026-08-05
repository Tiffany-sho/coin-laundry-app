"use client";

import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import * as Icon from "@/app/feacher/Icon";
import { getStores } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { buildCsvFiles } from "@/functions/csvExport";
import {
  EXPORT_PERIODS,
  dateToEpoch,
  defaultDateRange,
  formatDateSuffix,
  periodRange,
} from "@/functions/exportData";
import { planAtLeast } from "@/functions/plans";

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
  /** ⚠️ `"none"` は「分けない」。1 店舗ぶんを `"store"` で代用しないこと
   *    （店舗を改名していると 1 店舗なのに 2 シートに割れる） */
  const [splitMethod, setSplitMethod] = useState("period"); // "period" | "store" | "none"
  const { start: defaultStart, end: defaultEnd } = defaultDateRange();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [stores, setStores] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [loading, setLoading] = useState(false);
  /**
   * 経費と月別利益も出すか。**既定は false**（アプリと同じ）。
   *
   * ⚠️ 足すと表が 3 つになる（集金 / 経費 / 月別利益）。**CSV は 1 ファイルに
   *    縦に並ぶので「1 ファイル = 1 表」ではなくなり、会計ソフトへそのまま
   *    取り込めなくなる。** だから既定を変えず、選ばせて注意も出す。
   */
  const [includeExpenses, setIncludeExpenses] = useState(false);

  /* ⚠️ プラン名を並べない。足すたびに直し漏れる（plans.js の planAtLeast を参照） */
  const isPro = planAtLeast(plan, "pro");

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
        includeExpenses,
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

      const payload = await res.json();

      /*
        ⚠️ **経費を含めたときはサーバが 1 本の CSV を返す**（`csv`）。
           経費と月別利益は集金の表と行の意味も列の数も違うので、
           月ごと・店舗ごとに分けたファイルそれぞれに混ぜても意味を成さない。
           **応答の形が変わるので `csv` の有無で分けること。**
      */
      if (typeof payload.csv === "string") {
        await downloadFiles([
          { name: `collecie_${formatDateSuffix()}.csv`, csv: payload.csv },
        ]);
        return;
      }

      const { data } = payload;
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
          {/*
            ⚠️ **プリセットを先に出す。** 日付を 2 つとも手で選ぶのは
               「先月ぶんが欲しい」だけの人には重い（アプリは最初から
               プリセットだけにしてある）。日付入力も残して細かく決められるようにする。
          */}
          <HStack gap={2} wrap="wrap" mb={3}>
            {EXPORT_PERIODS.map((preset) => (
              <Button
                key={preset.months}
                size="xs"
                variant="outline"
                colorPalette="cyan"
                borderRadius="full"
                onClick={() => {
                  const { start, end } = periodRange(preset.months);
                  setStartDate(start);
                  setEndDate(end);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </HStack>
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
            {/* ⚠️ 1 店舗ぶんを「店舗ごと」で代用しない。店舗を改名していると
                   1 店舗なのに 2 シートに割れる（グループのキーが店名のため） */}
            <Button
              size="sm"
              variant={splitMethod === "none" ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setSplitMethod("none")}
            >
              分けない
            </Button>
          </HStack>
          <Text fontSize="xs" color="var(--text-faint)" mt={2}>
            {splitMethod === "none"
              ? fileFormat === "xlsx"
                ? "1つのシートにまとめます"
                : "1つのCSVファイルにまとめます"
              : fileFormat === "xlsx"
                ? `1つのExcelファイルにまとめ、${splitMethod === "period" ? "月" : "店舗"}ごとにシートを分けます`
                : `${splitMethod === "period" ? "月" : "店舗"}ごとに別々のCSVファイルをダウンロードします`}
          </Text>
        </Box>

        {/* 経費と月別利益 */}
        <Box>
          <Text fontSize="xs" color="var(--text-muted)" fontWeight="semibold" mb={2}>
            経費と月別利益
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant={includeExpenses ? "outline" : "solid"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setIncludeExpenses(false)}
            >
              含めない
            </Button>
            <Button
              size="sm"
              variant={includeExpenses ? "solid" : "outline"}
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => setIncludeExpenses(true)}
            >
              含める
            </Button>
          </HStack>
          {/*
            ⚠️ **CSV のときは必ず注意を出す。** 3 つの表が 1 ファイルに縦に並ぶので
               「1 ファイル = 1 表」ではなくなり、会計ソフトへそのまま取り込めない。
               分けて読みたい人には Excel を勧めること（あちらはシートが分かれる）。
          */}
          {includeExpenses && (
            <Text fontSize="xs" color="var(--text-faint)" mt={2} lineHeight="1.7">
              集金・経費・月別利益の3つの表を出します。
              {fileFormat === "csv" &&
                "CSVは1つのファイルに縦に並ぶため、会計ソフトへそのまま取り込めません。分けて読むにはExcelをお使いください。"}
            </Text>
          )}
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
