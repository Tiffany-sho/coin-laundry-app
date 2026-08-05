"use client";

import { useState } from "react";
import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import ExpensesPanel from "./ExpensesPanel";
import RecurringPanel from "./RecurringPanel";

/**
 * 経費ページの中身。**2 つのパネルを束ねて「＋」の 2 択を仲介する**（2026-08-05）。
 *
 * ⚠️ **ページ（server component）から state を渡せないので、ここが要る。**
 *    「＋」は上のパネルにあり、固定費のダイアログは下のパネルが持っているため、
 *    どちらか一方だけでは 2 択を組み立てられない。
 *
 * ⚠️ **`onAddRecurring` を渡すのは admin のときだけ。** 渡すと「＋」が 2 択になる。
 *    集金担当者に出すと**固定費のほうが必ず 403** になる（サーバの requireAdmin）。
 *    ⚠️ 単発の登録は集金担当者にも許しているので、**`canAdd` と `canManage` を
 *       1 つにまとめないこと。**
 */
export default function ExpensesBody({ stores, canAdd, canManage }) {
  /** 固定費の「新規登録」を外から開く。⚠️ 閉じたら必ず false に戻す（下のパネルが返す） */
  const [addRecurring, setAddRecurring] = useState(false);

  return (
    <>
      <ExpensesPanel
        stores={stores}
        canAdd={canAdd}
        canManage={canManage}
        onAddRecurring={canManage ? () => setAddRecurring(true) : undefined}
      />

      {/* ⚠️ 固定費の管理は admin だけ（追加・編集・削除とも。理由はサーバの requireAdmin） */}
      <Box mt={10}>
        <HStack gap={2} mb={1}>
          <Icon.LuRefreshCw size={18} color="var(--teal)" />
          <Heading as="h2" fontSize="lg" fontWeight="bold" color="var(--teal-deeper)">
            毎月の固定費
          </Heading>
        </HStack>
        <Text fontSize="xs" color="var(--text-muted)" mb={4}>
          家賃・水道光熱費など、毎月かかる支出。ここで登録すると上の一覧に自動で計上されます。
        </Text>
        <RecurringPanel
          stores={stores}
          canEdit={canManage}
          addOpen={addRecurring}
          onAddOpenChange={setAddRecurring}
        />
      </Box>
    </>
  );
}
