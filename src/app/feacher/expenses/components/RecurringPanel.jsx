"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Input,
  Portal,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  DEFAULT_EXPENSE_CATEGORY,
  EXPENSE_CATEGORIES,
  categoryColor,
} from "@/functions/expenseCategories";
import {
  currentMonthKey,
  expenseTargetName,
  formatMonthKey,
} from "@/functions/expenseSummary";
import {
  createRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
} from "@/app/api/supabaseFunctions/supabaseDatabase/expenses/action";
import { showToast } from "@/functions/makeToast/toast";

/**
 * 毎月の固定費（家賃・水道光熱費など）の定義。
 *
 * ⚠️ **実体の経費行は作らない。** 一覧を開くたびに定義から展開して計算している。
 *    そのため次の 2 つが起きる。画面でも必ず案内すること。
 *
 *    1. **金額を変えると過去の月まで遡って変わる。** 「今月から家賃が上がった」は
 *       既存の定義に終了月を入れて終わらせ、新しい定義を作る
 *    2. **削除すると過去の月からも消える。** 残したいなら削除ではなく終了月を入れる
 *
 * ⚠️ **日付は 1〜28 まで。** 29 以上を許すと、その日が無い月で翌月へ繰り上がり
 *    二重計上になる（008 の CHECK と同じ理由）。
 *
 * ⚠️ **`canEdit` は「admin か」。** 単発の経費（集金担当者も登録できる）とは
 *    条件が違う。サーバも追加・編集・削除のすべてで 403 を返す。
 */

const Label = ({ children }) => (
  <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)" mb={1.5}>
    {children}
  </Text>
);

const RecurringDialog = ({ open, onOpenChange, item, stores, onSaved }) => {
  const editing = Boolean(item?.id);

  const [name, setName] = useState(() => item?.name ?? "");
  const [amount, setAmount] = useState(() => (item ? String(item.amount) : ""));
  const [category, setCategory] = useState(() => item?.category ?? DEFAULT_EXPENSE_CATEGORY);
  const [dayOfMonth, setDayOfMonth] = useState(() => String(item?.dayOfMonth ?? 1));
  const [startMonth, setStartMonth] = useState(() => item?.startMonth ?? currentMonthKey());
  const [endMonth, setEndMonth] = useState(() => item?.endMonth ?? "");
  const [laundryId, setLaundryId] = useState(() => item?.laundryId ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    if (name.trim() === "") return setMessage("名前を入力してください");
    if (amount.trim() === "") return setMessage("金額を入力してください");

    const value = Number(amount);
    if (!Number.isInteger(value) || value < 0) {
      return setMessage("金額は 0 以上の整数で入力してください");
    }

    const day = Number(dayOfMonth);
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      return setMessage("日付は 1〜28 で指定してください");
    }
    if (!/^\d{4}-\d{2}$/.test(startMonth)) return setMessage("開始月を選んでください");
    if (endMonth !== "" && !/^\d{4}-\d{2}$/.test(endMonth)) {
      return setMessage("終了月が不正です");
    }
    if (endMonth !== "" && endMonth < startMonth) {
      return setMessage("終了月は開始月より後にしてください");
    }

    const input = {
      name: name.trim(),
      amount: value,
      category,
      dayOfMonth: day,
      startMonth,
      endMonth: endMonth === "" ? null : endMonth,
      laundryId: laundryId === "" ? null : laundryId,
    };

    setSaving(true);
    const { error } = editing
      ? await updateRecurringExpense(item.id, input)
      : await createRecurringExpense(input);
    setSaving(false);

    if (error) {
      setMessage(typeof error === "string" ? error : (error.msg ?? "保存に失敗しました"));
      showToast("error", "固定費の保存に失敗しました");
      return;
    }

    showToast("success", editing ? "固定費を更新しました" : "固定費を登録しました");
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
                {editing ? "固定費を編集" : "固定費を登録"}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} borderRadius="full" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body p={{ base: 5, md: 6 }}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Label>名前（40文字まで）</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    placeholder="家賃"
                    bg="white"
                    borderRadius="lg"
                    _focusVisible={{ borderColor: "cyan.400" }}
                  />
                </Box>

                <Box>
                  <Label>毎月の金額（円）</Label>
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
                          border="1px solid"
                          borderColor={active ? categoryColor(c) : "cyan.100"}
                          bg={active ? categoryColor(c) : "white"}
                          color={active ? "white" : "var(--text-muted)"}
                        >
                          {c}
                        </Box>
                      );
                    })}
                  </HStack>
                </Box>

                <Box>
                  <Label>毎月の計上日（1〜28）</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={28}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    bg="white"
                    borderRadius="lg"
                    _focusVisible={{ borderColor: "cyan.400" }}
                  />
                  {/* 29 以上を許すと、その日が無い月で翌月へ繰り上がり二重計上になる */}
                  <Text fontSize="10px" color="var(--text-faint)" mt={1}>
                    29〜31 は指定できません（その日が無い月で計上が飛ぶため）
                  </Text>
                </Box>

                <HStack gap={3} align="start">
                  <Box flex="1" minW={0}>
                    <Label>開始月</Label>
                    <Input
                      type="month"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      _focusVisible={{ borderColor: "cyan.400" }}
                    />
                  </Box>
                  <Box flex="1" minW={0}>
                    <Label>終了月（任意）</Label>
                    <Input
                      type="month"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      _focusVisible={{ borderColor: "cyan.400" }}
                    />
                  </Box>
                </HStack>

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
                    <option value="">組織全体（店舗を指定しない）</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.store}店
                      </option>
                    ))}
                  </Box>
                </Box>

                {/* 遡って変わる性質は必ず伝える。知らずに金額を書き換えると過去の月が動く */}
                <Box p={3} bg="amber.50" borderRadius="lg" border="1px solid" borderColor="amber.200">
                  <HStack gap={2} align="start">
                    <Box color="amber.600" pt={0.5}>
                      <Icon.LuInfo size={14} />
                    </Box>
                    <Text fontSize="xs" color="amber.900" lineHeight="1.6">
                      金額を変えると<strong>過去の月まで遡って変わります</strong>。
                      「今月から値上がりした」場合は、この定義に終了月を入れて終わらせ、
                      新しい定義を作ってください。
                    </Text>
                  </HStack>
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

const RecurringPanel = ({ stores = [], canEdit }) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const storeNameById = Object.fromEntries(stores.map((s) => [s.id, s.store]));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getRecurringExpenses();
    if (error) {
      setError(typeof error === "string" ? error : (error.msg ?? "取得に失敗しました"));
      setItems(null);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (item) => {
    // 削除は過去の月からも消える。終了月で終わらせる選択肢を必ず示す
    const ok = window.confirm(
      `「${item.name}」を削除しますか？\n\n過去の月の計上も消えます。これまでの分を残したい場合は、削除ではなく終了月を入れてください。`
    );
    if (!ok) return;

    const { error } = await deleteRecurringExpense(item.id);
    if (error) {
      showToast("error", "固定費の削除に失敗しました");
      return;
    }
    showToast("success", "固定費を削除しました");
    load();
  };

  return (
    <VStack align="stretch" gap={4}>
      {canEdit && (
        <Box>
          <Button
            colorPalette="cyan"
            borderRadius="full"
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Icon.LuPlus size={16} /> 固定費を登録
          </Button>
        </Box>
      )}

      {loading && <Skeleton height="20" borderRadius="xl" />}

      {error && (
        <HStack gap={2} color="var(--text-muted)">
          <Icon.LuTriangleAlert size={18} />
          <Text fontSize="sm">{error}</Text>
        </HStack>
      )}

      {!loading && !error && items?.length === 0 && (
        <Box
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          borderRadius="xl"
          p={6}
          textAlign="center"
        >
          {/* ⚠️ 登録できない人に登録を促さない */}
          <Text fontSize="sm" color="var(--text-faint)">
            毎月の固定費はまだ登録されていません
            {canEdit ? "" : "（登録できるのは管理者だけです）"}
          </Text>
        </Box>
      )}

      {!loading &&
        !error &&
        items?.map((item) => (
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
              <Box
                w="8px"
                h="8px"
                borderRadius="2px"
                bg={categoryColor(item.category)}
                flexShrink={0}
              />
            </Box>

            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight="bold" color="var(--text-main)">
                {item.name}
              </Text>
              <Text fontSize="xs" color="var(--text-muted)" mt={0.5}>
                {item.category}・毎月{item.dayOfMonth}日
              </Text>
              <Text fontSize="xs" color="var(--text-faint)" mt={0.5}>
                {formatMonthKey(item.startMonth)} 〜{" "}
                {item.endMonth ? formatMonthKey(item.endMonth) : "継続中"}
              </Text>
              <Text fontSize="xs" color="var(--text-faint)">
                {/* ⚠️ サーバが焼いた店名を優先する（担当店舗で絞られた一覧からは
                       担当外の店舗を引けない） */}
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
              {canEdit && (
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
                </HStack>
              )}
            </VStack>
          </HStack>
        ))}

      {dialogOpen && (
        <RecurringDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editing}
          stores={stores}
          onSaved={load}
        />
      )}
    </VStack>
  );
};

export default RecurringPanel;
