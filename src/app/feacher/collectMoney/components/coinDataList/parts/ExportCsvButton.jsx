"use client";

import { useState } from "react";
import { Button } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";

export default function ExportCsvButton() {
  const [loading, setLoading] = useState(false);
  const { startEpoch, endEpoch } = useUploadPage();

  const handleExport = async () => {
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
    <Button
      size="sm"
      variant="outline"
      colorPalette="cyan"
      borderRadius="full"
      onClick={handleExport}
      loading={loading}
      loadingText="出力中..."
    >
      <Icon.LuFileText />
      CSV
    </Button>
  );
}
