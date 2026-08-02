"use client";

import { useState } from "react";
import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import {
  MAX_PAYMENT_METHODS,
  MAX_PAYMENT_METHOD_NAME,
  useCoinLaundryForm,
} from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

/**
 * 店舗ごとの支払方法（PayPay・クレジットカードなど）。
 *
 * ⚠️ **現金は出さない。** 常に存在する暗黙の方法で、金額は
 *    「総額 − キャッシュレスの和」で出している。行として持たせると
 *    集金画面に現金が 2 つ並び、片方が総額に二重計上される。
 *
 * ⚠️ **「一覧から外す」は物理削除ではない。** 過去の集金（`collect_funds.cashless`）が
 *    その名前を参照しているので、外したものは `isActive: false` として
 *    **配列に残したまま**送る。下の「使わなくなった支払方法」に出して戻せるようにしてある。
 *
 * ⚠️ このフォームが `paymentMethods` を送らないと**据え置き**になる
 *    （送らない = 消す、ではない）。空配列は「全部無効にする」の意味。
 */

/** よく使うものを 1 タップで足せるように。⚠️ 「現金」は入れない */
const PRESET_METHODS = ["PayPay", "クレジットカード", "交通系IC", "楽天ペイ", "d払い"];

const PaymentMethodForm = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const [draft, setDraft] = useState("");

  const methods = state.paymentMethods ?? [];
  const active = methods.filter((m) => m.isActive);
  const retired = methods.filter((m) => !m.isActive);
  const remainingPresets = PRESET_METHODS.filter((name) => !methods.some((m) => m.name === name));

  const add = (name) => {
    const value = String(name).trim();
    if (!value) return;
    dispatch({ type: "ADD_PAYMENT_METHOD", payload: { name: value } });
    setDraft("");
  };

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
        <Text fontSize="xs" color="var(--text-muted)" lineHeight="1.7">
          現金以外の支払方法を登録すると、集金入力で方法ごとに金額を分けて記録できます。
          現金は登録しなくても常に記録されます。
        </Text>

        {/* ── 使用中 ── */}
        {active.length === 0 ? (
          <Text fontSize="sm" color="var(--text-faint)" textAlign="center" py={3}>
            現金のみ記録します
          </Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {active.map((method) => (
              <HStack
                key={method.name}
                gap={2}
                minH="52px"
                px={3}
                bg="var(--app-bg, #F0F9FF)"
                borderRadius="lg"
                border="1px solid"
                borderColor="cyan.100"
              >
                <Box color="var(--teal)" flexShrink={0}>
                  <Icon.LuCreditCard size={17} />
                </Box>
                <Text
                  flex="1"
                  minW={0}
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-main)"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {method.name}
                </Text>
                <Box
                  as="button"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "RETIRE_PAYMENT_METHOD", payload: { name: method.name } })
                  }
                  p={2}
                  borderRadius="md"
                  color="red.400"
                  cursor="pointer"
                  flexShrink={0}
                  _hover={{ bg: "red.50", color: "red.500" }}
                  aria-label={`${method.name}を一覧から外す`}
                >
                  <Icon.LuTrash2 size={16} />
                </Box>
              </HStack>
            ))}
          </VStack>
        )}

        {/* ── 追加 ── */}
        <VStack
          align="stretch"
          gap={2}
          pt={4}
          borderTop="1px solid"
          borderColor="var(--divider)"
        >
          <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
            支払方法を追加
          </Text>
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
              maxLength={MAX_PAYMENT_METHOD_NAME}
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
              追加
            </Button>
          </HStack>

          {remainingPresets.length > 0 && (
            <HStack wrap="wrap" gap={2} pt={1}>
              {remainingPresets.map((name) => (
                <Box
                  key={name}
                  as="button"
                  type="button"
                  onClick={() => add(name)}
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  minH="34px"
                  px={3}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  bg="var(--teal-pale, #CFFAFE)"
                  border="1px solid"
                  borderColor="cyan.200"
                  color="var(--teal-deeper)"
                  cursor="pointer"
                  _hover={{ bg: "cyan.100" }}
                >
                  <Icon.LuPlus size={13} /> {name}
                </Box>
              ))}
            </HStack>
          )}
        </VStack>

        {/*
          ⚠️ **使わなくなったものを見せる。** 過去の集金がその名前を参照しているので
             完全には消えない。「消したのに履歴に出る」を説明できるようにしておく。
        */}
        {retired.length > 0 && (
          <VStack
            align="stretch"
            gap={1}
            pt={4}
            borderTop="1px solid"
            borderColor="var(--divider)"
          >
            <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
              使わなくなった支払方法
            </Text>
            <Text fontSize="11px" color="var(--text-faint)" lineHeight="1.6" mb={1}>
              過去の集金記録には残ります。もう一度使うときは押して戻してください。
            </Text>
            <HStack wrap="wrap" gap={2}>
              {retired.map((method) => (
                <Box
                  key={method.name}
                  as="button"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "RESTORE_PAYMENT_METHOD", payload: { name: method.name } })
                  }
                  display="flex"
                  alignItems="center"
                  gap={1}
                  minH="34px"
                  px={3}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="var(--divider)"
                  color="var(--text-muted)"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  aria-label={`${method.name}を戻す`}
                >
                  <Icon.LuRefreshCcw size={13} /> {method.name}
                </Box>
              ))}
            </HStack>
          </VStack>
        )}

        {active.length >= MAX_PAYMENT_METHODS && (
          <Text fontSize="xs" color="var(--text-faint)">
            支払方法は {MAX_PAYMENT_METHODS} 件までです
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default PaymentMethodForm;
