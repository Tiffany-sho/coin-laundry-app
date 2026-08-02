export const dynamic = "force-dynamic";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { getAnnouncements } from "@/app/api/supabaseFunctions/supabaseDatabase/announcements/action";
import AnnouncementsPanel, {
  AnnouncementsHeading,
} from "@/app/feacher/settings/components/AnnouncementsPanel";
import * as Icon from "@/app/feacher/Icon";

export const metadata = {
  title: "開発者からのお知らせ | Collecie",
};

/**
 * 開発者からのお知らせ。組織に関係なく全ユーザー共通。
 *
 * ⚠️ 投稿は Supabase の Table Editor から手で行う（管理画面も書き込み API も無い）。
 *    作ると、アプリのトークンでお知らせを捏造できる経路が生まれる。
 *
 * ⚠️ **このテーブルは iOS アプリと共用しており、出し分けの列は無い。**
 *    Web 向けに書いたつもりのお知らせもそのままアプリに出るので、
 *    価格・プラン・外部サイトでの契約への言及は書かないこと（Guideline 3.1.3(a)）。
 *    運用ルールは 005_announcements.sql の COMMENT が正。
 */
export default async function SettingsNewsPage() {
  const { data, error } = await getAnnouncements();

  return (
    <Box maxW="720px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" align="start" mb={6} gap={4}>
        <AnnouncementsHeading />
        <Link href="/settings">
          <HStack
            gap={1}
            color="var(--text-muted)"
            fontSize="sm"
            cursor="pointer"
            flexShrink={0}
            _hover={{ color: "var(--text-main)" }}
          >
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      {error ? (
        <VStack
          align="stretch"
          gap={3}
          p={5}
          bg="var(--card-bg, #FFFFFF)"
          border="1px solid"
          borderColor="cyan.100"
          borderRadius="xl"
          boxShadow="var(--shadow-sm)"
        >
          <HStack gap={2} color="var(--text-muted)">
            <Icon.LuTriangleAlert size={18} />
            <Text fontSize="sm">{error}</Text>
          </HStack>
        </VStack>
      ) : (
        <AnnouncementsPanel items={data ?? []} />
      )}
    </Box>
  );
}
