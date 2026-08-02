"use client";

import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

/**
 * キャッシュレスの内訳（PayPay など）。店舗に支払方法が登録されているときだけ出る。
 *
 * ⚠️ **単位は「円」。** 上の機種別入力は硬貨の**枚数**（金額は × 100）。
 *    同じ画面に並ぶので取り違えないこと。
 *
 * ⚠️ **現金の欄は作らない。** 現金は暗黙の方法で、
 *    `totalFunds − sum(cashless[].amount)` で出す。欄を作ると二重計上になる。
 *
 * ⚠️ **合計金額（totalFunds）にキャッシュレスを足すのはサーバ。**
 *    `createData` が `formData.totalFunds + cashless.sum` を入れるので、
 *    画面側で足して送らないこと（足すと二重になる）。
 */
const CashlessInputs = ({ methods = [], values, onChange }) => {
  if (methods.length === 0) return null;

  const total = methods.reduce((sum, m) => sum + (Number(values[m.id]) || 0), 0);

  return (
    <Box py={{ base: 5, md: 6 }}>
      <HStack mb={1} color="var(--teal, #0891B2)">
        <Icon.LuCreditCard size={20} />
        <Text fontSize="md" fontWeight="semibold">
          キャッシュレス
        </Text>
      </HStack>
      <Text fontSize="xs" color="var(--text-faint)" mb={4}>
        現金以外で受け取った金額を入力します（円）
      </Text>

      <VStack align="stretch" gap={3}>
        {methods.map((method) => (
          <HStack key={method.id} gap={3}>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="var(--text-main)"
              flex="1"
              minW={0}
            >
              {method.name}
            </Text>
            <HStack gap={1} flexShrink={0}>
              <Text fontSize="sm" color="var(--text-muted)">
                ¥
              </Text>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={values[method.id] ?? ""}
                onChange={(e) => onChange(method.id, e.target.value)}
                placeholder="0"
                w={{ base: "120px", md: "150px" }}
                h="48px"
                textAlign="right"
                bg="white"
                borderRadius="lg"
                fontFamily="'Space Mono', monospace"
                _focusVisible={{ borderColor: "cyan.400" }}
              />
            </HStack>
          </HStack>
        ))}

        {total > 0 && (
          <HStack
            justify="space-between"
            pt={3}
            borderTop="1px solid"
            borderColor="var(--divider)"
          >
            <Text fontSize="xs" color="var(--text-muted)">
              キャッシュレス合計
            </Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="var(--teal)"
              fontFamily="'Space Mono', monospace"
            >
              ¥{total.toLocaleString()}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default CashlessInputs;

/**
 * 画面の入力（`{ [methodId]: "1200" }`）を `createData` が受け取る形へ。
 *
 * ⚠️ **0 円と空欄は落とす。** サーバも 0 を捨てるが、送らないほうが
 *    「入力しなかった」ことが素直に伝わる。
 */
export function toCashlessPayload(values) {
  return Object.entries(values ?? [])
    .map(([methodId, raw]) => ({ methodId, amount: Number(raw) }))
    .filter((e) => Number.isInteger(e.amount) && e.amount > 0);
}
