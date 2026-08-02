"use client";

import { useState } from "react";
import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

/**
 * 店舗ごとの支払方法（PayPay・クレジットカードなど）。
 *
 * ⚠️ **現金は出さない。** 常に存在する暗黙の方法で、現金額は
 *    `totalFunds − sum(cashless[].amount)` で出す。行として持たせると
 *    「現金を無効化できる」「二重に数える」の両方が起きる。
 *
 * ⚠️ **削除しても行は消えない。** サーバ側が `is_active = false` にするだけ。
 *    過去の `collect_funds.cashless` が参照しているため。
 *
 * ⚠️ このフォームが `paymentMethods` を送らないと**据え置き**になる
 *    （送らない = 消す、ではない）。空配列は「全部無効にする」の意味。
 */

/** 1 店舗あたりの上限。⚠️ サーバ側（reconcileStorePaymentMethods）と揃えること */
const MAX_METHODS = 10;
const MAX_NAME_LENGTH = 20;

/** よく使うものは 1 タップで足せるように */
const SUGGESTIONS = ["PayPay", "クレジットカード", "交通系IC", "楽天ペイ", "d払い"];

const PaymentMethodForm = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const [draft, setDraft] = useState("");

  const methods = state.paymentMethods ?? [];
  const full = methods.length >= MAX_METHODS;

  const add = (name) => {
    const value = String(name).trim();
    if (!value || full) return;
    dispatch({ type: "ADD_PAYMENT_METHOD", payload: { name: value } });
    setDraft("");
  };

  const remaining = SUGGESTIONS.filter((s) => !methods.some((m) => m.name === s));

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
        <Box>
          <HStack gap={2} mb={1}>
            <Box color="var(--teal)">
              <Icon.LuCreditCard size={16} />
            </Box>
            <Text fontWeight="semibold" color="var(--text-main)" fontSize="sm">
              支払方法
            </Text>
          </HStack>
          <Text fontSize="xs" color="var(--text-faint)">
            集金画面でキャッシュレスの内訳を入力できるようになります。現金は登録不要です。
          </Text>
        </Box>

        {methods.length > 0 && (
          <VStack align="stretch" gap={2}>
            {methods.map((method) => (
              <HStack
                key={method.name}
                justify="space-between"
                p={3}
                borderRadius="lg"
                border="1px solid"
                borderColor={method.isActive ? "cyan.100" : "var(--divider)"}
                bg={method.isActive ? "white" : "var(--app-bg, #F0F9FF)"}
                gap={2}
              >
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={method.isActive ? "var(--text-main)" : "var(--text-faint)"}
                  textDecoration={method.isActive ? "none" : "line-through"}
                  minW={0}
                >
                  {method.name}
                </Text>

                <HStack gap={1} flexShrink={0}>
                  {/* 無効にすると集金画面から消える。過去のデータは残る */}
                  <Box
                    as="button"
                    type="button"
                    onClick={() =>
                      dispatch({ type: "TOGGLE_PAYMENT_METHOD", payload: { name: method.name } })
                    }
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="semibold"
                    color={method.isActive ? "var(--text-muted)" : "var(--teal)"}
                    cursor="pointer"
                    _hover={{ bg: "cyan.50" }}
                  >
                    {method.isActive ? "使わない" : "戻す"}
                  </Box>
                  <Box
                    as="button"
                    type="button"
                    onClick={() =>
                      dispatch({ type: "REMOVE_PAYMENT_METHOD", payload: { name: method.name } })
                    }
                    p={1.5}
                    borderRadius="md"
                    color="var(--text-faint)"
                    cursor="pointer"
                    _hover={{ bg: "red.50", color: "red.500" }}
                    aria-label={`${method.name} を一覧から外す`}
                  >
                    <Icon.LuX size={14} />
                  </Box>
                </HStack>
              </HStack>
            ))}
          </VStack>
        )}

        {!full && (
          <>
            <HStack gap={2}>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  // Enter でフォーム全体が送信されるのを止める
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add(draft);
                  }
                }}
                maxLength={MAX_NAME_LENGTH}
                placeholder="PayPay など"
                size="sm"
                bg="white"
                borderRadius="lg"
                _focusVisible={{ borderColor: "cyan.400" }}
              />
              <Button
                type="button"
                size="sm"
                colorPalette="cyan"
                borderRadius="lg"
                onClick={() => add(draft)}
                disabled={draft.trim() === ""}
                flexShrink={0}
              >
                <Icon.LuPlus size={15} /> 追加
              </Button>
            </HStack>

            {remaining.length > 0 && (
              <HStack wrap="wrap" gap={2}>
                {remaining.map((name) => (
                  <Box
                    key={name}
                    as="button"
                    type="button"
                    onClick={() => add(name)}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                    border="1px dashed"
                    borderColor="cyan.300"
                    color="var(--teal)"
                    bg="white"
                    cursor="pointer"
                    _hover={{ bg: "cyan.50" }}
                  >
                    + {name}
                  </Box>
                ))}
              </HStack>
            )}
          </>
        )}

        {full && (
          <Text fontSize="xs" color="var(--text-faint)">
            支払方法は {MAX_METHODS} 件までです
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default PaymentMethodForm;
