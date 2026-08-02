"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { LuUsers } from "@/app/feacher/Icon";
import { collecterOptions, initialLimit } from "@/functions/fundHistory";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";

/**
 * 売上履歴を集金者で絞り込む。
 *
 * ⚠️ **選択肢は今表示している行から作る。** メンバー一覧から作らないこと。
 *    退会した人の集金が履歴には残っているので、メンバー一覧だけだと
 *    その行を絞り込む手段が無くなる。
 *
 * ⚠️ 集金者が 1 人しかいないときは出さない（押しても何も変わらないため）。
 */
const CollecterFilter = () => {
  const { displayData, collecter, setCollecter, setHistoryLimit, orderAmount } =
    useUploadPage();

  /*
    ⚠️ **絞り込みを変えたら表示量を初期値に戻す。** 3 か月ぶん出した状態で
       絞ると、残っているのが 1 か月でも「さらに表示」の残数が実態とずれる。
  */
  const pick = (next) => {
    setCollecter(next);
    setHistoryLimit(initialLimit(orderAmount === "date"));
  };
  const options = collecterOptions(displayData);

  if (options.length < 2) return null;

  const Chip = ({ active, onClick, children }) => (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      px={3}
      py={1.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight="semibold"
      whiteSpace="nowrap"
      cursor="pointer"
      transition="all 0.2s"
      border="1px solid"
      borderColor={active ? "var(--teal)" : "cyan.100"}
      bg={active ? "var(--teal)" : "var(--card-bg, #FFFFFF)"}
      color={active ? "white" : "var(--text-muted)"}
      _hover={active ? {} : { bg: "cyan.50", borderColor: "cyan.300" }}
    >
      {children}
    </Box>
  );

  return (
    <HStack gap={2} align="center" wrap="wrap">
      <HStack gap={1} color="var(--text-faint)" flexShrink={0}>
        <LuUsers size={13} />
        <Text fontSize="xs">集金者</Text>
      </HStack>

      <Chip active={!collecter} onClick={() => pick(null)}>
        全員
      </Chip>

      {options.map((option) => (
        <Chip
          key={option.id}
          active={collecter === option.id}
          onClick={() => pick(collecter === option.id ? null : option.id)}
        >
          {option.name}
          <Text as="span" opacity={0.7} ml={1}>
            {option.count}
          </Text>
        </Chip>
      ))}
    </HStack>
  );
};

export default CollecterFilter;
