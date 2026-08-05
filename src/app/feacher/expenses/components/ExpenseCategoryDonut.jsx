"use client";

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { categoryColor } from "@/functions/expenseCategories";

/**
 * カテゴリ別の内訳をドーナツで出す。**アプリの `ExpenseCategoryPie` に合わせた形。**
 *
 * ⚠️ **合計はドーナツの中央にしか出さない。** 見出しにも出すと同じ数字が
 *    数センチ離れて 2 回並ぶ（アプリ側と同じ規約）。
 *
 * ⚠️ **金額が数値であることまで確かめる。** 欠けた行が混ざると
 *    Recharts が NaN の扇を描こうとして**円ごと消える。**
 * ⚠️ **0 円と負は数えない。** 扇の角度が出せない。
 *
 * ⚠️ **アプリは `react-native-svg` を入れていないので素の View で描いている。**
 *    こちらは Recharts が既に入っているのでそれを使う。**見た目を合わせるのが目的で、
 *    実装まで合わせる必要は無い**（アプリ側に Recharts は入れられない）。
 */
export default function ExpenseCategoryDonut({ categories, total, count }) {
  const data = (categories ?? []).filter(
    (row) => Number.isFinite(row?.total) && row.total > 0
  );

  return (
    /*
      ⚠️ **狭いときは縦、広いときは横に並べる**（2026-08-05）。
         内訳を常に下へ置くと、カテゴリが多い月で**円と内訳が縦に長く伸びて
         下の「毎月の固定費」まで遠くなる。**
      ⚠️ **円のほうを縮ませない**（`flexShrink={0}`）。内訳のカテゴリ名が長いと
         円が潰れて中央の合計が読めなくなる。
    */
    <Flex direction={{ base: "column", md: "row" }} gap={{ base: 3, md: 6 }} align="center">
      <Box
        position="relative"
        h={{ base: "180px", md: "200px" }}
        w={{ base: "100%", md: "200px" }}
        flexShrink={0}
      >
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius="62%"
                outerRadius="92%"
                startAngle={90}
                endAngle={-270}
                /* ⚠️ アニメーションを切る。月を送るたびに扇が回り直して落ち着かない */
                isAnimationActive={false}
                stroke="none"
              >
                {data.map((row) => (
                  <Cell key={row.category} fill={categoryColor(row.category)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* ⚠️ 中央の合計は円が無いとき（経費 0 件）も出す。¥0 と分かるほうがよい */}
        <VStack
          position="absolute"
          inset="0"
          justify="center"
          gap={0}
          pointerEvents="none"
        >
          <Text fontSize="xs" color="var(--text-muted)">
            経費合計
          </Text>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="black"
            lineHeight="1.1"
            letterSpacing="tight"
            color="var(--text-main)"
            fontFamily="'Space Mono', monospace"
          >
            ¥{(Number.isFinite(total) ? total : 0).toLocaleString()}
          </Text>
          <Text fontSize="xs" color="var(--text-faint)">
            {count}件
          </Text>
        </VStack>
      </Box>

      {/* ⚠️ 横に並べたときは内訳が残りの幅を取る（`flex="1"`）。
             付けないと中身の幅にしか広がらず、右側が空いて見える */}
      {data.length > 0 && (
        <VStack align="stretch" gap={1.5} flex="1" w="100%" minW={0}>
          {data.map((row) => (
            <HStack key={row.category} justify="space-between" gap={2}>
              <HStack gap={1.5} minW={0}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="2px"
                  bg={categoryColor(row.category)}
                  flexShrink={0}
                />
                <Text fontSize="xs" color="var(--text-muted)">
                  {row.category}
                </Text>
              </HStack>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-main)" flexShrink={0}>
                ¥{row.total.toLocaleString()}
              </Text>
            </HStack>
          ))}
        </VStack>
      )}
    </Flex>
  );
}
