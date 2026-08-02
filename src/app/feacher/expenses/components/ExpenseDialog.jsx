"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Input,
  Portal,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  DEFAULT_EXPENSE_CATEGORY,
  EXPENSE_CATEGORIES,
  categoryColor,
} from "@/functions/expenseCategories";
import { getEpochTimeInSeconds } from "@/functions/makeDate/date";
import {
  createExpense,
  updateExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { showToast } from "@/functions/makeToast/toast";

/**
 * 経費の登録・編集。
 *
 * ⚠️ **金額の単位は「円」。** 集金の `funds`（硬貨の枚数）と同じ画面に並ぶので
 *    取り違えないこと。ここはそのまま円で送る。
 *
 * ⚠️ **日付は `getEpochTimeInSeconds(y, m, d)` で組む。** `<input type="date">` の値を
 *    `new Date(value).getTime()` にすると、ブラウザのタイムゾーン次第で 1 日ずれる。
 *
 * ⚠️ **展開した固定費（`recurring: true`）はここへ渡さない。** id が実在しないので
 *    更新できない。呼び出し側で編集導線を出さないこと。
 */

/** epoch（JST 深夜 0 時）→ `<input type="date">` の "YYYY-MM-DD" */
const JST_OFFSET = 32_400_000;
function toDateInput(epoch) {
  const d = new Date((epoch ?? Date.now()) + JST_OFFSET);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" → JST 深夜 0 時の epoch */
function fromDateInput(value) {
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return null;
  return getEpochTimeInSeconds(y, m, d);
}

const Label = ({ children }) => (
  <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={1.5}>
    {children}
  </Text>
);

const ExpenseDialog = ({ open, onOpenChange, expense, stores = [], onSaved }) => {
  const editing = Boolean(expense?.id);

  const [date, setDate] = useState(() => toDateInput(expense?.date));
  const [amount, setAmount] = useState(() => (expense ? String(expense.amount) : ""));
  const [category, setCategory] = useState(
    () => expense?.category ?? DEFAULT_EXPENSE_CATEGORY
  );
  const [laundryId, setLaundryId] = useState(() => expense?.laundryId ?? "");
  const [note, setNote] = useState(() => expense?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    const epoch = fromDateInput(date);
    if (epoch === null) return setMessage("日付を入力してください");

    // ⚠️ 空文字は Number("") = 0 になるので、先に弾く
    if (amount.trim() === "") return setMessage("金額を入力してください");
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 0) {
      return setMessage("金額は 0 以上の整数で入力してください");
    }

    const input = {
      date: epoch,
      amount: value,
      category,
      note: note.trim() === "" ? null : note.trim(),
      laundryId: laundryId === "" ? null : laundryId,
    };

    setSaving(true);
    const { error } = editing
      ? await updateExpense(expense.id, input)
      : await createExpense(input);
    setSaving(false);

    if (error) {
      setMessage(typeof error === "string" ? error : (error.msg ?? "保存に失敗しました"));
      showToast("error", "経費の保存に失敗しました");
      return;
    }

    showToast("success", editing ? "経費を更新しました" : "経費を登録しました");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="xl"
            maxW={{ base: "92%", md: "480px" }}
            bg="var(--app-bg, #F0F9FF)"
          >
            <Dialog.Header pt={5} px={{ base: 5, md: 6 }} pb={0}>
              <Dialog.Title fontSize="md" fontWeight="bold" color="cyan.900">
                {editing ? "経費を編集" : "経費を登録"}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} borderRadius="full" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body p={{ base: 5, md: 6 }}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Label>日付</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    bg="white"
                    borderRadius="lg"
                    _focusVisible={{ borderColor: "cyan.400" }}
                  />
                </Box>

                <Box>
                  <Label>金額（円）</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    bg="white"
                    borderRadius="lg"
                    _focusVisible={{ borderColor: "cyan.400" }}
                  />
                </Box>

                <Box>
                  <Label>カテゴリ</Label>
                  <HStack wrap="wrap" gap={2}>
                    {EXPENSE_CATEGORIES.map((c) => {
                      const active = c === category;
                      return (
                        <Box
                          key={c}
                          as="button"
                          type="button"
                          onClick={() => setCategory(c)}
                          aria-pressed={active}
                          px={3}
                          py={1.5}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="semibold"
                          cursor="pointer"
                          transition="all 0.2s"
                          border="1px solid"
                          borderColor={active ? categoryColor(c) : "cyan.100"}
                          bg={active ? categoryColor(c) : "white"}
                          color={active ? "white" : "var(--text-muted)"}
                          _hover={active ? {} : { borderColor: "cyan.300" }}
                        >
                          {c}
                        </Box>
                      );
                    })}
                  </HStack>
                </Box>

                <Box>
                  <Label>店舗</Label>
                  <Box
                    as="select"
                    value={laundryId}
                    onChange={(e) => setLaundryId(e.target.value)}
                    w="full"
                    h="40px"
                    px={3}
                    bg="white"
                    border="1px solid"
                    borderColor="cyan.100"
                    borderRadius="lg"
                    fontSize="sm"
                    color="var(--text-main)"
                  >
                    {/* laundry_id が NULL = どの店舗にも紐づかない組織全体の経費 */}
                    <option value="">組織全体（店舗を指定しない）</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.store}店
                      </option>
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Label>メモ（任意・200文字まで）</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder="洗剤の仕入れ など"
                    bg="white"
                    borderRadius="lg"
                    _focusVisible={{ borderColor: "cyan.400" }}
                  />
                </Box>

                {message && (
                  <HStack gap={2} color="red.600">
                    <Icon.LuTriangleAlert size={16} />
                    <Text fontSize="sm" fontWeight="medium">
                      {message}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer px={{ base: 5, md: 6 }} pb={5} gap={3}>
              <Button
                variant="outline"
                borderRadius="lg"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button
                colorPalette="cyan"
                borderRadius="lg"
                onClick={submit}
                loading={saving}
                loadingText="保存中"
              >
                {editing ? "更新する" : "登録する"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ExpenseDialog;
