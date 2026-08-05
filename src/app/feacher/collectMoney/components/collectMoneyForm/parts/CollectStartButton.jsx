"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Dialog, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { COLLECT_SCOPES, hasActivePaymentMethods } from "@/functions/collectScope";

/**
 * 集金を始めるボタン。**支払方法がある店舗では「何を集金するか」を先に聞く。**
 *
 * ⚠️ **集金の入口は Web に 4 か所ある**（店舗一覧 / 店舗カード / 収益ページ /
 *    ホームのクイックアクション）。**1 つでもここを通さないと、そこだけ
 *    既定の `both` で開く**（型エラーは出ない）。アプリも同じ理由で
 *    `useCollectLauncher()` の 1 か所に集約してある。
 *
 * ⚠️ **支払方法が 1 件も無い店舗では聞かない。** 選択肢が実質「現金」しか無いのに
 *    1 タップ増えるだけになる。そのまま `scope=cash` で開く。
 *
 * ⚠️ **`children` に見た目を渡す形にしてある。** 入口ごとにボタンの大きさも色も
 *    違うので、ここで見た目を固定すると呼び出し側が使えなくなる。
 */
export default function CollectStartButton({ store, children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const ask = hasActivePaymentMethods(store);

  const go = (scope) => {
    router.push(`/collectMoney/${store.id}/newData?scope=${scope}`);
  };

  return (
    <>
      <Box
        as="span"
        display="contents"
        onClick={() => (ask ? setOpen(true) : go("cash"))}
        cursor="pointer"
      >
        {children}
      </Box>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="var(--card-bg, #FFFFFF)"
              borderRadius="20px"
              boxShadow="0 12px 40px rgba(14,116,144,0.18)"
              maxW="400px"
              mx={4}
              overflow="hidden"
            >
              <Dialog.Header py={5} px={6} pb={2}>
                <VStack gap={0} align="center" w="full">
                  <Text fontSize="md" fontWeight="bold" color="var(--text-main)">
                    何を集金しますか？
                  </Text>
                  <Text fontSize="sm" color="var(--text-muted)">
                    {store.store}店
                  </Text>
                </VStack>
              </Dialog.Header>

              <Dialog.Body px={6} pb={6}>
                <VStack gap={2} align="stretch">
                  {COLLECT_SCOPES.map((scope) => (
                    <Box
                      key={scope.value}
                      as="button"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        go(scope.value);
                      }}
                      textAlign="left"
                      px={4}
                      py={3}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="cyan.200"
                      bg="cyan.50"
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{ bg: "cyan.100" }}
                    >
                      <HStack justify="space-between" gap={3}>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">
                            {scope.label}
                          </Text>
                          <Text fontSize="xs" color="var(--text-muted)">
                            {scope.description}
                          </Text>
                        </Box>
                        <Icon.LuChevronRight size={16} color="var(--teal)" />
                      </HStack>
                    </Box>
                  ))}

                  <Button
                    variant="outline"
                    borderRadius="xl"
                    borderColor="var(--border, #E2E8F0)"
                    color="var(--text-muted)"
                    onClick={() => setOpen(false)}
                    mt={1}
                  >
                    キャンセル
                  </Button>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
