"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { categoryColor } from "@/functions/expenseCategories";
import {
  byCategory,
  canGoNext,
  convertCursor,
  currentCursor,
  expensePeriod,
  expenseTargetName,
  monthlyTotals,
  shiftCursor,
  totalAmount,
} from "@/functions/expenseSummary";
import RevenueTabs from "@/app/feacher/collectMoney/components/coinDataList/parts/RevenueTabs";
import ExpenseCategoryDonut from "./ExpenseCategoryDonut";
import { createNowData } from "@/functions/makeDate/date";
import {
  deleteExpense,
  getExpenses,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { showToast } from "@/functions/makeToast/toast";
import ExpenseDialog from "./ExpenseDialog";

/**
 * 経費の一覧。**月ごと / 年ごとに切り替えて見る**（2026-08-05）。
 *
 * ⚠️ **並びは iOS 版に合わせてある:**
 *      絞り込み → 月 / 年 → 期間送り + ドーナツ + 明細 →（下に）毎月の固定費
 *    ⚠️ **絞り込みを一覧の直前に戻さない。** 合計とドーナツも絞り込みに追従するので、
 *       絞る操作より後ろに置くと**数字が変わった理由が読めない。**
 *
 * ⚠️ **年モードでは明細を並べず月の小計にする。** 1 年ぶんは数百行になり得る。
 *    押すとその月の月モードへ降りる。
 *
 * ⚠️ **登録ボタンは右下に固定**（アプリの FAB と同じ）。**「毎月の固定費」は
 *    ここから足さない**（下の `RecurringPanel` が自分の登録ボタンを持っている。
 *    1 つにまとめると、固定費は admin だけなので**集金担当者には片方が
 *    必ず 403 になる**）。
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

const UNITS = [
  { value: "month", label: "月ごと" },
  { value: "year", label: "年ごと" },
];

const ExpensesPanel = ({ stores = [], canAdd, canManage }) => {
  /**
   * 月ごとに見るか年ごとに見るか（2026-08-05。アプリと同じ）。
   * ⚠️ 送りの位置（`cursor`）は月モードなら "YYYY-MM"、年モードなら西暦。
   *    **型が変わるので、単位と一緒に持ち回ること**（`expenseSummary` の
   *    `expensePeriod` / `shiftCursor` を必ず通す）。
   */
  const [unit, setUnit] = useState("month");
  const [cursor, setCursor] = useState(() => currentCursor("month"));
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

  const period = expensePeriod(unit, cursor);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = expensePeriod(unit, cursor);
    const { data, error } = await getExpenses(start, end);
    if (error) {
      setError(typeof error === "string" ? error : (error.msg ?? "取得に失敗しました"));
      setItems(null);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [unit, cursor]);

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
  /* 年モードで出す月の小計。⚠️ **明細を 1 年ぶん並べない**（数百行になり得る） */
  const months = unit === "year" ? monthlyTotals(visible) : [];
  const forward = canGoNext(unit, cursor);

  return (
    <VStack align="stretch" gap={5}>
      {/*
        並びは iOS 版に合わせてある（2026-08-05）:
          絞り込み → 月 / 年 → 期間送り + ドーナツ + 明細 →（下に）毎月の固定費
        ⚠️ **絞り込みを一覧の直前に戻さない。** 合計とドーナツも絞り込みに
           追従するので、**絞る操作より後ろに置くと数字が変わった理由が読めない。**
      */}

      {/* ── どこの支出かで絞る ──
          ⚠️ **店舗が 1 軒も無いときは出さない**（「すべて」と「組織全体」しか並ばない） */}
      {stores.length > 0 && (
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

      {/* ── 月ごと / 年ごと ──
          ⚠️ 切り替えても見ている場所を保つ（`convertCursor`）。今月・今年へ飛ばすと
             過去を調べている途中の人が見ていた場所を見失う */}
      <RevenueTabs
        tabs={UNITS}
        value={unit}
        onChange={(next) => {
          setCursor((c) => convertCursor(c, unit, next));
          setUnit(next);
        }}
      />

      {/* ── 期間の送り + ドーナツ ── */}
      <Box
        bg="var(--card-bg, #FFFFFF)"
        border="1px solid"
        borderColor="cyan.100"
        borderRadius="xl"
        boxShadow="var(--shadow-sm)"
        p={{ base: 4, md: 6 }}
      >
        <HStack justify="space-between" gap={2} mb={2}>
          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={() => setCursor((c) => shiftCursor(unit, c, -1))}
            aria-label="前へ"
          >
            <Icon.LuChevronLeft size={16} />
          </Button>

          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="var(--teal-deeper)">
            {period.label}
          </Text>

          {/* ⚠️ **未来へは送らせない。** 空の期間を無限にめくれてしまう */}
          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            disabled={!forward}
            onClick={() => setCursor((c) => shiftCursor(unit, c, 1))}
            aria-label="次へ"
          >
            <Icon.LuChevronRight size={16} />
          </Button>
        </HStack>

        {loading ? (
          <Skeleton height="48" borderRadius="lg" />
        ) : (
          <ExpenseCategoryDonut
            categories={categories}
            total={total}
            count={visible.length}
          />
        )}
      </Box>

      {/* ── 一覧 ── */}
      {error && (
        <HStack gap={2} color="var(--text-muted)">
          <Icon.LuTriangleAlert size={18} />
          <Text fontSize="sm">{error}</Text>
        </HStack>
      )}

      {/* ── 年モードは月の小計 ── */}
      {!loading && !error && unit === "year" && months.length > 0 && (
        <VStack align="stretch" gap={2}>
          {months.map((row) => (
            <HStack
              key={row.key}
              as="button"
              type="button"
              /* ⚠️ 単位ごと切り替える。カーソルだけ変えると年が月として読まれる */
              onClick={() => {
                setUnit("month");
                setCursor(row.key);
              }}
              bg="var(--card-bg, #FFFFFF)"
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="xl"
              boxShadow="var(--shadow-sm)"
              p={4}
              gap={3}
              cursor="pointer"
              transition="all 0.15s"
              _hover={{ borderColor: "cyan.300" }}
            >
              <Box flex="1" minW={0} textAlign="left">
                <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                  {row.label}
                </Text>
                <Text fontSize="xs" color="var(--text-faint)">
                  {row.count}件
                </Text>
              </Box>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
                color="var(--text-main)"
                fontFamily="'Space Mono', monospace"
                flexShrink={0}
              >
                ¥{row.total.toLocaleString()}
              </Text>
              <Icon.LuChevronRight size={16} color="var(--teal)" />
            </HStack>
          ))}
        </VStack>
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
            {scope !== "all"
              ? "この絞り込みに合う経費はありません"
              : unit === "year"
                ? "この年の経費はまだありません"
                : "この月の経費はまだありません"}
          </Text>
        </Box>
      )}

      {/* ⚠️ 明細は月モードだけ。年モードは上の小計から降りてもらう */}
      {!loading && !error && unit === "month" && visible.length > 0 && (
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

      {/*
        経費の追加。**右下に固定**（2026-08-05。アプリの FAB と同じ）。
        ⚠️ **「毎月の固定費」はここから足さない。** あちらはページ下の
           「毎月の固定費」に自分の登録ボタンを持っている（`RecurringPanel`）。
           1 つのボタンに 2 択を持たせると、**集金担当者には片方が必ず 403 になる**
           （固定費は admin だけ）。
        ⚠️ **`bottom` は収益ページの書き出しボタン・店舗一覧の「＋」と同じ値。**
           フッターナビの上に載せるための逃げなので、片方だけ変えると
           ページによってボタンの高さが変わる。
      */}
      {canAdd && (
        <Button
          position="fixed"
          bottom={{ base: "15%", md: "5%" }}
          right={{ base: "5%", md: "5%" }}
          zIndex="1350"
          colorPalette="cyan"
          borderRadius="full"
          fontWeight="semibold"
          fontSize={{ base: "sm", md: "md" }}
          px={{ base: 5, md: 6 }}
          h={{ base: "52px", md: "56px" }}
          boxShadow="0 4px 15px rgba(8,145,178,0.35)"
          _active={{ transform: "scale(0.96)" }}
          transition="all 0.2s"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Icon.LuPlus size={18} /> 経費を登録
        </Button>
      )}

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
