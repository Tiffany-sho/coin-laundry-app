"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { categoryColor } from "@/functions/expenseCategories";
import {
  byCategory,
  expenseTargetName,
  currentMonthKey,
  formatMonthKey,
  monthRange,
  shiftMonthKey,
  totalAmount,
} from "@/functions/expenseSummary";
import { createNowData } from "@/functions/makeDate/date";
import {
  deleteExpense,
  getExpenses,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { showToast } from "@/functions/makeToast/toast";
import ExpenseDialog from "./ExpenseDialog";

/**
 * 経費の一覧。月ごとに見る。
 *
 * ⚠️ **必ず月で切って取る。** 経費は増え続けるので、切らないと PostgREST の
 *    1000 行上限で古いものから黙って欠ける（`getExpenses` 側のコメント参照）。
 *
 * ⚠️ **毎月の固定費は展開されて混ざって返る**（`recurring: true`）。実体の行では
 *    ないので **編集・削除できない**。押せる導線を出さないこと。
 *
 * ⚠️ **`canAdd`（登録）と `canManage`（削除）は別**（2026-08-03）。
 *    登録は集金担当者にも許し、消せるのは admin だけ。**1 つにまとめないこと。**
 *
 * ⚠️ **編集の可否は行ごとに違う。** admin は全部、集金担当者は
 *    **自分が登録した当月の分だけ。** 判定はサーバがして `editable` で返すので、
 *    **画面で組み立て直さないこと**（同じ規則を 2 か所に置くとずれる）。
 */

const CategoryDot = ({ category }) => (
  <Box w="8px" h="8px" borderRadius="2px" bg={categoryColor(category)} flexShrink={0} />
);

const ExpensesPanel = ({ stores = [], canAdd, canManage }) => {
  const [month, setMonth] = useState(() => currentMonthKey());
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  /**
   * どこの支出かで絞る。
   * ⚠️ **`"all"` が「絞らない」。`null` ではない。** `laundry_id` が NULL の行は
   *    「組織全体の経費」という**別の意味**なので、兼ねると
   *    **組織全体の経費だけを見る手段が消える。**
   */
  const [scope, setScope] = useState("all");

  const storeNameById = Object.fromEntries(stores.map((s) => [s.id, s.store]));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = monthRange(month);
    const { data, error } = await getExpenses(start, end);
    if (error) {
      setError(typeof error === "string" ? error : (error.msg ?? "取得に失敗しました"));
      setItems(null);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item) => {
    if (!window.confirm("この経費を削除しますか？")) return;
    const { error } = await deleteExpense(item.id);
    if (error) {
      showToast("error", "経費の削除に失敗しました");
      return;
    }
    showToast("success", "経費を削除しました");
    load();
  };

  /*
    ⚠️ **絞り込みはサーバに投げず、取ってきた月ぶんを手元で分ける。**
       `getExpenses` の `laundryId` は「その店舗のものだけ」を返すので、
       **「組織全体（laundry_id が NULL）だけ」を取る手段が無い。**
  */
  const visible = (items ?? []).filter((item) => {
    if (scope === "all") return true;
    if (scope === "org") return item.laundryId == null;
    return item.laundryId === scope;
  });

  /* ⚠️ 合計もカテゴリ内訳も絞り込みに追従させる（数字と行が食い違わないように） */
  const total = totalAmount(visible);
  const categories = byCategory(visible);

  return (
    <VStack align="stretch" gap={5}>
      {/* ── 月の行き来 ── */}
      <HStack justify="space-between" gap={2}>
        <Button
          size="sm"
          variant="outline"
          borderRadius="full"
          onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
          aria-label="前の月"
        >
          <Icon.LuChevronLeft size={16} />
        </Button>

        <VStack gap={0}>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="var(--teal-deeper)">
            {formatMonthKey(month)}
          </Text>
          {month !== currentMonthKey() && (
            <Box
              as="button"
              type="button"
              onClick={() => setMonth(currentMonthKey())}
              fontSize="xs"
              color="var(--teal)"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
            >
              今月へ戻る
            </Box>
          )}
        </VStack>

        <Button
          size="sm"
          variant="outline"
          borderRadius="full"
          onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
          aria-label="次の月"
        >
          <Icon.LuChevronRight size={16} />
        </Button>
      </HStack>

      {/* ── 合計とカテゴリ内訳 ── */}
      <Box
        bg="var(--card-bg, #FFFFFF)"
        border="1px solid"
        borderColor="cyan.100"
        borderRadius="xl"
        boxShadow="var(--shadow-sm)"
        p={{ base: 4, md: 6 }}
      >
        <Text fontSize="sm" fontWeight="semibold" color="var(--teal-deeper)" mb={2}>
          経費合計
        </Text>

        {loading ? (
          <Skeleton height="10" width="50%" borderRadius="lg" />
        ) : (
          <>
            <HStack align="baseline" gap={1} mb={categories.length ? 4 : 0}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" color="var(--text-muted)">
                ¥
              </Text>
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="black"
                lineHeight="1"
                letterSpacing="tight"
                color="var(--text-main)"
              >
                {total.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="var(--text-muted)" alignSelf="flex-end" pb={1}>
                {visible.length}件
              </Text>
            </HStack>

            {categories.length > 0 && (
              <VStack align="stretch" gap={1.5} pt={3} borderTop="1px solid" borderColor="var(--divider)">
                {categories.map((row) => (
                  <HStack key={row.category} justify="space-between" gap={2}>
                    <HStack gap={1.5} minW={0}>
                      <CategoryDot category={row.category} />
                      <Text fontSize="xs" color="var(--text-muted)">
                        {row.category}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="semibold" color="var(--text-main)" flexShrink={0}>
                      ¥{row.total.toLocaleString()}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </>
        )}
      </Box>

      {/* ── 操作 ── */}
      <HStack gap={3} wrap="wrap">
        {canAdd && (
          <Button
            colorPalette="cyan"
            borderRadius="full"
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Icon.LuPlus size={16} /> 経費を登録
          </Button>
        )}
        <Link href="/collectMoney/expenses/recurring">
          <Button variant="outline" colorPalette="cyan" borderRadius="full" size="sm">
            <Icon.LuRefreshCw size={15} /> 毎月の固定費
          </Button>
        </Link>
      </HStack>

      {/* ── 一覧 ── */}
      {error && (
        <HStack gap={2} color="var(--text-muted)">
          <Icon.LuTriangleAlert size={18} />
          <Text fontSize="sm">{error}</Text>
        </HStack>
      )}

      {/*
        どこの支出かで絞る。⚠️ **店舗が 1 軒も無いときは出さない**
           （「すべて」と「組織全体」しか並ばず、押す意味が無い）。
      */}
      {!loading && !error && stores.length > 0 && (
        <HStack gap={2} wrap="wrap">
          {[
            { key: "all", label: "すべて" },
            { key: "org", label: "組織全体" },
            ...stores.map((store) => ({ key: store.id, label: `${store.store}店` })),
          ].map((option) => (
            <Button
              key={option.key}
              size="xs"
              borderRadius="full"
              variant={scope === option.key ? "solid" : "outline"}
              colorPalette="cyan"
              onClick={() => setScope(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </HStack>
      )}

      {!loading && !error && visible.length === 0 && (
        <Box
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          borderRadius="xl"
          p={6}
          textAlign="center"
        >
          <Text fontSize="sm" color="var(--text-faint)">
            {scope === "all"
              ? "この月の経費はまだありません"
              : "この絞り込みに合う経費はありません"}
          </Text>
        </Box>
      )}

      {!loading && !error && visible.length > 0 && (
        <VStack align="stretch" gap={2}>
          {visible.map((item) => (
            <HStack
              key={item.id}
              bg="var(--card-bg, #FFFFFF)"
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="xl"
              boxShadow="var(--shadow-sm)"
              p={4}
              gap={3}
              align="start"
            >
              <Box pt={1}>
                <CategoryDot category={item.category} />
              </Box>

              <Box flex="1" minW={0}>
                <HStack gap={2} mb={0.5} wrap="wrap">
                  <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
                    {item.category}
                  </Text>
                  <Text fontSize="xs" color="var(--text-faint)">
                    {createNowData(item.date)}
                  </Text>
                  {/* 展開された固定費。実体が無いので編集できない */}
                  {item.recurring && (
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg="cyan.50"
                      color="var(--teal-deeper)"
                      fontSize="10px"
                      fontWeight="bold"
                    >
                      固定費
                    </Box>
                  )}
                </HStack>
                <Text fontSize="sm" color="var(--text-main)" lineHeight="1.5">
                  {item.note || "（メモなし）"}
                </Text>
                <Text fontSize="xs" color="var(--text-faint)" mt={0.5}>
                  {/* ⚠️ サーバが焼いた店名を優先する。店舗一覧は担当店舗で絞られるので、
                         集金担当者・閲覧者では担当外の店舗が引けない */}
                  {item.laundryId
                    ? `${expenseTargetName(item, storeNameById)}店`
                    : "組織全体"}
                </Text>
              </Box>

              <VStack align="end" gap={1} flexShrink={0}>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color="var(--text-main)"
                  fontFamily="'Space Mono', monospace"
                >
                  ¥{item.amount.toLocaleString()}
                </Text>
                {/*
                  ⚠️ **編集と削除で条件が違う。**
                     編集 … サーバが行ごとに返す `editable`（admin は全部、
                            集金担当者は自分が登録した当月の分だけ）
                     削除 … admin だけ（`canManage`）
                     ⚠️ **`editable` の規則をここに書き直さないこと**（サーバとずれる）。
                     ⚠️ 古い応答では `editable` が無いので `canManage` に倒す
                        （**true に倒さない**）。
                */}
                {!item.recurring && (item.editable ?? canManage) && (
                  <HStack gap={1}>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setDialogOpen(true);
                      }}
                      p={1.5}
                      borderRadius="md"
                      color="var(--text-faint)"
                      cursor="pointer"
                      _hover={{ bg: "cyan.50", color: "var(--teal)" }}
                      aria-label="編集"
                    >
                      <Icon.LuPencil size={14} />
                    </Box>
                    {canManage && (
                      <Box
                        as="button"
                        type="button"
                        onClick={() => remove(item)}
                        p={1.5}
                        borderRadius="md"
                        color="var(--text-faint)"
                        cursor="pointer"
                        _hover={{ bg: "red.50", color: "red.500" }}
                        aria-label="削除"
                      >
                        <Icon.LuTrash2 size={14} />
                      </Box>
                    )}
                  </HStack>
                )}
              </VStack>
            </HStack>
          ))}
        </VStack>
      )}

      {loading && <Skeleton height="20" borderRadius="xl" />}

      {/* key を変えて開くたびに初期値を入れ直す（編集 → 新規で前の値が残るのを防ぐ） */}
      {dialogOpen && (
        <ExpenseDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          expense={editing}
          stores={stores}
          onSaved={load}
        />
      )}
    </VStack>
  );
};

export default ExpensesPanel;
