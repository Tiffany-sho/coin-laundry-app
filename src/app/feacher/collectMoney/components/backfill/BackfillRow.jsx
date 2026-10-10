"use client";

import { Box, Flex, HStack, IconButton, Input, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import SelectDate from "@/app/feacher/collectMoney/components/selectDate/SelectDate";
import { getJstDateParts } from "@/functions/makeDate/date";

/**
 * 過去の集金データの 1 行。**「集金日」と「合計金額」だけ**を受ける。
 *
 * ⚠️ **日付は `SelectDate` に任せること。** あれが `getEpochTimeInSeconds(y, m, d)` を
 *    通して JST 深夜 0 時の epoch（ミリ秒）を返す。ここで `new Date().getTime()` を
 *    使ったり 9 時間ぶんを自前で足したりすると、端末の TZ 次第で 1 日ずれる
 *    （docs/ios/08-data-model.md の 8.4）。
 *
 * ⚠️ **`SelectDate` に渡すのは「ローカル深夜 0 時」で、受け取るのが「JST 深夜 0 時」。**
 *    あれは初期値を `new Date(epoc)` の**ローカル**年月日から作るので、JST の epoch を
 *    そのまま渡すと JST 以外の端末で 1 日前を表示し、返ってきた値を次の行へ引き継ぐと
 *    **「行を追加」のたびに 1 日ずつ遡っていく。** `getJstDateParts()` で年月日に
 *    戻してからローカル深夜 0 時に積み直すと、往復しても値が動かない
 *    （JST の端末では両者が同じ値なので何も変わらない）。
 *
 * ⚠️ **金額の単位は「円」。** 機種別入力の `fundsArray[].funds` は硬貨の**枚数**で、
 *    円にするには ×100 が要る。ここは枚数を受けないので ×100 してはいけない。
 */
const BackfillRow = ({ index, entry, duplicated, onChangeDate, onChangeAmount, onRemove, removable }) => {
  /* 上の注記のとおり、表示用にローカル深夜 0 時へ積み直してから渡す */
  const { year, month, day } = getJstDateParts(entry.date);
  const pickerEpoc = new Date(year, month - 1, day).getTime();

  return (
    <Box
      p={4}
      mb={3}
      borderRadius="xl"
      bg="var(--card-bg, #FFFFFF)"
      borderWidth="1px"
      borderColor={duplicated ? "orange.300" : "var(--divider, #F1F5F9)"}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="xs" fontWeight="semibold" color="var(--text-faint, #94A3B8)">
          {index + 1} 件目
        </Text>
        {/* 行が 1 つだけのときは消させない（空の画面になって追加し直しになる） */}
        {removable && (
          <IconButton
            aria-label={`${index + 1} 件目を削除`}
            variant="ghost"
            size="sm"
            color="var(--text-muted, #64748B)"
            _hover={{ color: "red.500", bg: "red.50" }}
            onClick={onRemove}
          >
            <Icon.LuTrash2 />
          </IconButton>
        )}
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={4} align={{ base: "stretch", md: "flex-end" }}>
        <Box flex="1" minW={0}>
          <HStack gap={1} mb={1} color="var(--text-muted, #64748B)">
            <Icon.LuCalendar size={14} />
            <Text fontSize="sm" fontWeight="semibold">
              集金日
            </Text>
          </HStack>
          <SelectDate epoc={pickerEpoc} setEpoc={onChangeDate} />
        </Box>

        <Box flex="1" minW={0}>
          <HStack gap={1} mb={1} color="var(--text-muted, #64748B)">
            <Icon.RiMoneyCnyCircleLine size={14} />
            <Text fontSize="sm" fontWeight="semibold">
              合計金額
            </Text>
          </HStack>
          <Flex align="center" gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="var(--text-muted, #64748B)">
              ¥
            </Text>
            <Input
              /*
                ⚠️ `type="number"` にしない。スピナーとホイールで値が黙って変わるうえ、
                   `inputMode` だけで携帯のテンキーは出る。
              */
              inputMode="numeric"
              placeholder="0"
              value={entry.amount}
              onChange={(e) => onChangeAmount(e.target.value)}
              fontSize="lg"
              fontWeight="bold"
              bg="var(--card-bg, #FFFFFF)"
            />
          </Flex>
        </Box>
      </Flex>

      {/*
        同じ日付の行が他にもある、という注意。
        ⚠️ **登録は妨げない。** 1 日に 2 回集金することは実際にある（iOS 版と同じ判断）。
      */}
      {duplicated && (
        <HStack gap={1} mt={3} color="orange.600">
          <Icon.LuTriangleAlert size={14} />
          <Text fontSize="xs">同じ集金日の行が他にもあります（そのまま登録できます）</Text>
        </HStack>
      )}
    </Box>
  );
};

export default BackfillRow;
