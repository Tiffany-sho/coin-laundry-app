import { Box, HStack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

/**
 * 店舗が受け付けている支払方法のチップ。店舗一覧・店舗詳細で使う。
 *
 * ⚠️ **使用中のものだけ出す。** `attachPaymentMethods` は店舗フォームで戻せるように
 *    `isActive: false` のものも返してくる。絞らずに出すと、使わなくなった方法が
 *    まだ使えるように見える。
 *
 * ⚠️ **現金は payment_methods に行が無い**（常に存在する暗黙の方法）。
 *    したがって「キャッシュレスが 0 件」＝「現金のみ」。チップを 1 つも出さずに
 *    黙ると、支払方法を登録し忘れているのか現金のみなのか区別が付かないので、
 *    「現金のみ」と明示する。
 */
const PaymentMethodChips = ({ methods, size = "sm" }) => {
  const active = (methods ?? []).filter((m) => m?.isActive);

  const fontSize = size === "sm" ? "11px" : "xs";
  const iconSize = size === "sm" ? 11 : 13;

  if (active.length === 0) {
    return (
      <HStack gap={1} color="var(--text-faint)" mt={1}>
        <Icon.TbCoinYenFilled size={iconSize} />
        <Text fontSize={fontSize}>現金のみ</Text>
      </HStack>
    );
  }

  return (
    <HStack gap={1.5} wrap="wrap" mt={1}>
      {/* 現金は常に受け付けるので先頭に固定で出す */}
      <HStack
        gap={1}
        px={2}
        py={0.5}
        borderRadius="full"
        bg="var(--app-bg, #F0F9FF)"
        border="1px solid"
        borderColor="var(--divider, #F1F5F9)"
        color="var(--text-muted)"
      >
        <Icon.TbCoinYenFilled size={iconSize} />
        <Text fontSize={fontSize} fontWeight="semibold">
          現金
        </Text>
      </HStack>

      {active.map((method) => (
        <HStack
          key={method.id ?? method.name}
          gap={1}
          px={2}
          py={0.5}
          borderRadius="full"
          bg="var(--teal-pale, #CFFAFE)"
          border="1px solid"
          borderColor="cyan.200"
          color="var(--teal-deeper)"
          minW={0}
        >
          <Box flexShrink={0}>
            <Icon.LuCreditCard size={iconSize} />
          </Box>
          <Text
            fontSize={fontSize}
            fontWeight="semibold"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {method.name}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
};

export default PaymentMethodChips;
