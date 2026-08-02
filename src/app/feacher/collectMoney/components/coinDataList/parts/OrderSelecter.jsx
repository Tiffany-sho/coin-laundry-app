"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp } from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { SORT_AXES, nextSort } from "@/functions/fundHistory";

/**
 * 売上履歴の並び替え。**アプリの `src/components/common/SortControls.tsx` の移植。**
 *
 * 軸ごとにボタンを 1 つ置き、**効いているものをもう一度押すと向きが反転する。**
 *
 * ⚠️ **`Select`（ドロップダウン）に戻さないこと。** 4 つの並び順を平らに並べていたが、
 *    「開く → 選ぶ → 閉じる」の 3 手が要るうえ、**軸と向きが 1 つの文字列に
 *    潰れている**ので「日付で並んでいる」ことと「新しい順」であることを
 *    別々に読み取れなかった。アプリは同じ理由でダイアログをやめている。
 *
 * ⚠️ **向きは言葉で出す。** 矢印だけだと「上が新しい」のか「上が古い」のか伝わらない。
 * ⚠️ **効いていない軸は塗らない。** 2 つ同時に効いていると誤解される。
 *
 * ⚠️ **並び替えの実体はサーバの ORDER BY**（`orderAmount` / `upOrder` を
 *    `getOrgCollectFundsInPeriod` に渡している）。手元の行だけ並べ替えないこと。
 *    「売上が高い順」の先頭が、取ってきた期間の中の最高額でしかなくなる。
 */

const OrderSelecter = () => {
  const { orderAmount, setOrderAmount, upOrder, setUpOrder } = useUploadPage();

  return (
    <HStack gap={2} wrap="wrap" ml={{ base: 0, sm: "auto" }}>
      {SORT_AXES.map((axis) => {
        const active = axis.value === orderAmount;
        // 効いていない軸は「押したらこうなる」向きを見せる
        const asc = active ? upOrder : axis.defaultAsc;
        const Arrow = asc ? LuArrowUp : LuArrowDown;

        return (
          <Box
            as="button"
            type="button"
            key={axis.value}
            onClick={() => {
              /* 効いている軸をもう一度押したら反転、別の軸なら既定の向きで切り替え。
                 ⚠️ 規則は `nextSort` に置いてある（アプリと揃えるため画面に書かない） */
              const next = nextSort({ orderAmount, upOrder }, axis.value);
              setOrderAmount(next.orderAmount);
              setUpOrder(next.upOrder);
            }}
            aria-pressed={active}
            aria-label={`${axis.label}で並び替え${active ? "（もう一度押すと逆順）" : ""}`}
            display="flex"
            alignItems="center"
            gap={1.5}
            minH="36px"
            px={3}
            borderRadius="full"
            border="1.5px solid"
            borderColor={active ? "cyan.400" : "var(--divider, #F1F5F9)"}
            bg={active ? "cyan.50" : "var(--card-bg, #FFFFFF)"}
            color={active ? "var(--teal-deeper, #155E75)" : "var(--text-muted, #64748B)"}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: "cyan.400" }}
          >
            <Arrow size={13} />
            <Text fontSize="xs" fontWeight={active ? "bold" : "medium"}>
              {axis.label}
            </Text>
            {/* ⚠️ 効いている軸だけ向きを言葉で添える */}
            {active && (
              <Text fontSize="11px" opacity={0.85}>
                {asc ? axis.hint.asc : axis.hint.desc}
              </Text>
            )}
          </Box>
        );
      })}
    </HStack>
  );
};

export default OrderSelecter;
