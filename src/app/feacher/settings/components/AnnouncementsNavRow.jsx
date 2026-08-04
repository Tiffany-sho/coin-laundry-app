"use client";

import Link from "next/link";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { unreadCount, unreadSince } from "@/functions/announcements";
import { useLastSeenAt } from "../hooks/useAnnouncementsRead";

/**
 * 設定ページの「開発者からのお知らせ」行。未読があれば件数バッジを出す。
 *
 * ⚠️ 見た目は OtherActionsCard の NavRow に合わせてある。あちらを直したらここも直すこと
 *    （バッジのためだけにクライアント側へ切り出しているので分かれている）。
 *
 * ⚠️ 未読の線は localStorage にしか無い。SSR では 0 になるため初回描画は
 *    「全件未読」の件数が出る。ハイドレート後に正しい件数へ寄る。
 */
const AnnouncementsNavRow = ({ items = [], accountCreatedAt = null }) => {
  const lastSeenAt = useLastSeenAt();
  /* ⚠️ 登録より前のお知らせを未読にしない。生の lastSeenAt を渡さないこと
        （新規登録した人の設定画面が最初からバッジ付きで始まる） */
  const count = unreadCount(items, unreadSince(lastSeenAt, accountCreatedAt));

  return (
    <Link href="/settings/news">
      <HStack
        justify="space-between"
        p={4}
        borderRadius="lg"
        border="1px solid"
        borderColor="cyan.100"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
      >
        <HStack gap={3} minW={0}>
          <Flex
            w="40px"
            h="40px"
            bg="var(--teal-pale)"
            borderRadius="lg"
            align="center"
            justify="center"
            color="var(--teal)"
            flexShrink={0}
          >
            <Icon.LuBell size={20} />
          </Flex>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
              開発者からのお知らせ
            </Text>
            <Text fontSize="xs" color="var(--text-muted)">
              新機能や不具合の対応状況
            </Text>
          </Box>
        </HStack>

        <HStack gap={2} flexShrink={0}>
          {count > 0 && (
            <Box
              minW="20px"
              h="20px"
              px={1.5}
              borderRadius="full"
              bg="orange.500"
              color="white"
              fontSize="11px"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              justifyContent="center"
              aria-label={`未読 ${count} 件`}
            >
              {count}
            </Box>
          )}
          <Icon.LuChevronRight color="var(--text-faint)" />
        </HStack>
      </HStack>
    </Link>
  );
};

export default AnnouncementsNavRow;
