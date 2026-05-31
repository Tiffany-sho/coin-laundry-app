"use client";

import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Skeleton } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { getCollectMonthlySummary } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const EPOCH_OFFSET = 32400000; // JST +9h

function groupByMonth(records) {
  const map = new Map();
  records.forEach(({ date, totalFunds }) => {
    const d = new Date(date + EPOCH_OFFSET);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth() + 1;
    const key = `${y}-${String(mo).padStart(2, "0")}`;
    const label = `${y}年${mo}月`;
    if (!map.has(key)) map.set(key, { key, label, total: 0 });
    map.get(key).total += totalFunds;
  });
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function computeChanges(months) {
  return months.map((m, i) => {
    const prev = i > 0 ? months[i - 1] : null;
    const mom =
      prev && prev.total > 0
        ? ((m.total - prev.total) / prev.total) * 100
        : null;

    const [y, mo] = m.key.split("-").map(Number);
    const yoyKey = `${y - 1}-${String(mo).padStart(2, "0")}`;
    const yoyEntry = months.find((x) => x.key === yoyKey);
    const yoy =
      yoyEntry && yoyEntry.total > 0
        ? ((m.total - yoyEntry.total) / yoyEntry.total) * 100
        : null;

    return { ...m, mom, yoy };
  });
}

function ChangeCell({ value }) {
  if (value === null)
    return (
      <Text color="var(--text-faint)" fontSize="sm" textAlign="right">
        —
      </Text>
    );
  const isPositive = value >= 0;
  return (
    <HStack gap={0.5} justify="flex-end">
      <Box color={isPositive ? "#0E9F6E" : "#E02424"} display="flex">
        {isPositive ? <Icon.LuTrendingUp size={12} /> : <Icon.LuTrendingDown size={12} />}
      </Box>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color={isPositive ? "#0E9F6E" : "#E02424"}
      >
        {isPositive ? "+" : ""}
        {value.toFixed(1)}%
      </Text>
    </HStack>
  );
}

export default function MonthlySummaryCard({ storeId = null }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCollectMonthlySummary(storeId).then(({ data, error }) => {
      if (error || !data) {
        setLoading(false);
        return;
      }
      const months = groupByMonth(data);
      const withChanges = computeChanges(months);
      setRows(withChanges.slice(-12).reverse());
      setLoading(false);
    });
  }, [storeId]);

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
        <HStack gap={2}>
          <Box color="var(--teal)">
            <Icon.LuCalendar size={15} />
          </Box>
          <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
            月次サマリー
          </Text>
        </HStack>

        {loading ? (
          <VStack gap={2}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="38px" borderRadius="md" />
            ))}
          </VStack>
        ) : !rows || rows.length === 0 ? (
          <Text color="var(--text-faint)" fontSize="sm">
            データがありません
          </Text>
        ) : (
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>年月</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>合計</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>前月比</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>前年同月比</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.key}
                    style={i % 2 !== 0 ? { background: "#F8FAFC" } : {}}
                  >
                    <td style={tdStyle}>
                      <Text fontSize="sm" color="var(--text-main)">
                        {row.label}
                      </Text>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <Text
                        fontSize="sm"
                        fontFamily="'Space Mono', monospace"
                        color="var(--text-main)"
                        fontWeight="medium"
                      >
                        ¥{row.total.toLocaleString()}
                      </Text>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <ChangeCell value={row.mom} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <ChangeCell value={row.yoy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

const thStyle = {
  padding: "8px 12px",
  fontSize: "11px",
  fontWeight: "600",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid var(--divider)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid var(--divider)",
  whiteSpace: "nowrap",
};
