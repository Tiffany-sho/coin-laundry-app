"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { LuChevronDown } from "@/app/feacher/Icon";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { initialLimit } from "@/functions/fundHistory";

/**
 * 売上履歴の「さらに表示」。**アプリの `ShowMoreRow` と同じ役割。**
 *
 * ⚠️ **取得範囲を広げるボタンではない。表示量だけを増やす。**
 *    データは最初から全期間ぶん来ていて、並び替えもその全部に対して
 *    サーバが済ませてある。
 *
 * ⚠️ **2 か月ずつ取りに行く形へ戻さないこと**（2026-08-03 まではそうだった）。
 *    - 「売上が高い順」の先頭が**読み込んだ 2 か月の中の最高額**にしかならない
 *    - 古い塊を末尾に**継ぎ足す**ので、売上順のときは**全体としては
 *      並んでいない**列ができる（塊ごとには並んでいる）
 *    - **集金の無い 2 か月に当たると打ち切られ**、それより古い履歴に二度と届かない
 *
 * ⚠️ **残りの件数／月数を必ず出す。** あとどれだけあるか分からないと押す気にならない。
 */
const AddDataBtn = ({ remaining = 0, unit = "month" }) => {
  const { setHistoryLimit, orderAmount } = useUploadPage();

  if (remaining <= 0) return null;

  return (
    <Button
      variant="outline"
      color="var(--teal, #0891B2)"
      border="none"
      onClick={() => setHistoryLimit((prev) => prev + initialLimit(orderAmount === "date"))}
    >
      <HStack gap={1}>
        <LuChevronDown size={16} />
        <Text>
          さらに表示（残り{remaining}
          {unit === "month" ? "か月" : "件"}）
        </Text>
      </HStack>
    </Button>
  );
};

export default AddDataBtn;
