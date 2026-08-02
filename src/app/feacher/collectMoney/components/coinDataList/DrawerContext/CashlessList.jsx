"use client";

import { useState } from "react";
import { Badge, Box, Editable, Flex, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { buildMethodRows, sumCashless } from "@/functions/cashlessMath";

/**
 * 集金 1 件のキャッシュレス内訳。ドロワーの中で金額を直せるようにする。
 *
 * ⚠️ **2026-08-02 まで Web にはこの欄が無かった。** 集金レコードは `cashless` を
 *    持っているのに画面が読まないので、**PayPay の金額を間違えて登録すると
 *    Web からは見ることも直すこともできなかった**（アプリだけが編集できた）。
 *
 * ⚠️ **機器ごとの内訳を持つ集金では編集させない。** その場合 `cashless` 列は
 *    `fundsArray[].cashless` からサーバが組み直す派生値で、ここから上書きすると
 *    機器ごとの内訳と食い違う（アプリも同じ理由で読み取り専用にしている）。
 *
 * ⚠️ **現金の行は作らない。** 現金は暗黙の方法で `総額 − Σcashless` で出す。
 *    行にすると「現金を無効化できる」「二重に数える」の両方が起きる。
 */
const CashlessList = ({
  recorded,
  methods,
  perMachineMode,
  readOnly = false,
  onCommit,
}) => {
  const rows = buildMethodRows(recorded, methods);
  /** 直前に保存した値。Editable の defaultValue を差し替えるためのキーにも使う */
  const [saving, setSaving] = useState(null);

  // 記録も無く、いま受け付けている方法も無い ＝ 現金のみの店舗。欄ごと出さない
  if (rows.length === 0) return null;

  const total = rows.reduce((acc, row) => acc + row.amount, 0);

  const commit = async (id, raw) => {
    const amount = parseInt(raw, 10);
    if (!Number.isInteger(amount) || amount < 0) return;
    if (amount === rows.find((r) => r.id === id)?.amount) return;

    setSaving(id);
    /*
      ⚠️ **全部の行を送る。** 変更した 1 件だけ送ると、サーバは
         「送られてこなかった方法＝消された」として扱うので他の内訳が消える
         （`normalizeCashless` は受け取った配列で置き換える）。
      ⚠️ 0 円は落とす。サーバも捨てるが、送らないほうが意図が伝わる。
    */
    const entries = rows
      .map((row) => ({ methodId: row.id, amount: row.id === id ? amount : row.amount }))
      .filter((entry) => entry.amount > 0);

    await onCommit(entries);
    setSaving(null);
  };

  return (
    <Box
      mt={6}
      p={5}
      borderRadius="xl"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Flex justify="space-between" align="center" mb={1}>
        <HStack gap={2} color="var(--teal, #0891B2)">
          <Icon.LuCreditCard size={18} />
          <Text fontSize="sm" fontWeight="semibold">
            キャッシュレス
          </Text>
        </HStack>
        <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)">
          ¥{total.toLocaleString()}
        </Text>
      </Flex>

      <Text fontSize="xs" color="var(--text-faint, #94A3B8)" mb={4}>
        {perMachineMode
          ? "機器ごとに記録されているため、ここでは編集できません"
          : "現金以外で受け取った金額（円）"}
      </Text>

      <Stack gap={3}>
        {rows.map((row) => (
          <Flex key={row.id} justify="space-between" align="center" gap={3}>
            <HStack gap={2} minW={0}>
              <Text fontSize="sm" fontWeight="medium" color="var(--text-main, #1E3A5F)" truncate>
                {row.name}
              </Text>
              {/* ⚠️ 使用停止の方法も金額を 0 に戻せるよう並べる。ただし理由を示す */}
              {row.retired && (
                <Badge size="sm" colorPalette="gray" flexShrink={0}>
                  使用停止
                </Badge>
              )}
            </HStack>

            {readOnly || perMachineMode ? (
              <Text
                fontSize="md"
                fontWeight="semibold"
                color="var(--text-main, #1E3A5F)"
                fontFamily="'Space Mono', monospace"
              >
                ¥{row.amount.toLocaleString()}
              </Text>
            ) : (
              <Editable.Root
                key={`${row.id}:${row.amount}`}
                defaultValue={String(row.amount)}
                submitMode="enter"
                onValueCommit={(e) => commit(row.id, e.value)}
                disabled={saving !== null}
              >
                <Flex align="center" justify="flex-end" gap={2}>
                  <Editable.Preview
                    fontWeight="semibold"
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontFamily="'Space Mono', monospace"
                    _hover={{ bg: "gray.100" }}
                  >
                    ¥{row.amount.toLocaleString()}
                  </Editable.Preview>
                  {/* ⚠️ fontSize は 16px 未満にしない。iOS Safari が入力時に拡大する */}
                  <Editable.Input w="110px" textAlign="right" fontSize="16px" />
                  <Editable.Control>
                    <Editable.EditTrigger asChild>
                      <IconButton variant="ghost" size="sm" aria-label={`${row.name}を編集`}>
                        <Icon.LuPencilLine />
                      </IconButton>
                    </Editable.EditTrigger>
                    <Editable.CancelTrigger asChild>
                      <IconButton variant="outline" size="sm" aria-label="やめる">
                        <Icon.LuX />
                      </IconButton>
                    </Editable.CancelTrigger>
                    <Editable.SubmitTrigger asChild>
                      <IconButton variant="solid" size="sm" aria-label="保存">
                        <Icon.LuCheck />
                      </IconButton>
                    </Editable.SubmitTrigger>
                  </Editable.Control>
                </Flex>
              </Editable.Root>
            )}
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};

export default CashlessList;

/** ドロワーの見出しに出す総額。⚠️ 現金ぶんだけを出さないこと（総額と食い違う） */
export function displayTotal(cashTotal, cashless) {
  return cashTotal + sumCashless(cashless);
}
