import { Card, Button, HStack, Text, Box, Flex, Heading, VStack, Separator } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import AnnouncementsNavRow from "./AnnouncementsNavRow";
import { APP_STORE_URL, hasAppStoreLink } from "@/functions/appStore";

const NavRow = ({ href, icon, label, description }) => (
  <Link href={href}>
    <HStack
      justify="space-between" p={4}
      borderRadius="lg" border="1px solid" borderColor="cyan.100"
      cursor="pointer" transition="all 0.2s"
      _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
    >
      <HStack gap={3}>
        <Flex w="40px" h="40px" bg="var(--teal-pale)" borderRadius="lg"
          align="center" justify="center" color="var(--teal)" flexShrink={0}>
          {icon}
        </Flex>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{label}</Text>
          {description && <Text fontSize="xs" color="var(--text-muted)">{description}</Text>}
        </Box>
      </HStack>
      <Icon.LuChevronRight color="var(--text-faint)" />
    </HStack>
  </Link>
);

/*
  外部サイトへ出る行。⚠️ **NavRow（next/link）を使い回さない。**
  あちらは内部遷移用で、App Store のような外部 URL に使うとプリフェッチが走る。
  ⚠️ `rel="noopener noreferrer"` を外さないこと。
*/
const ExtRow = ({ href, icon, label, description }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <HStack
      justify="space-between" p={4}
      borderRadius="lg" border="1px solid" borderColor="cyan.100"
      cursor="pointer" transition="all 0.2s"
      _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
    >
      <HStack gap={3}>
        <Flex w="40px" h="40px" bg="var(--teal-pale)" borderRadius="lg"
          align="center" justify="center" color="var(--teal)" flexShrink={0}>
          {icon}
        </Flex>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{label}</Text>
          {description && <Text fontSize="xs" color="var(--text-muted)">{description}</Text>}
        </Box>
      </HStack>
      <Icon.LuChevronRight color="var(--text-faint)" />
    </HStack>
  </a>
);

export default function OtherActionsCard({ announcements = [], accountCreatedAt = null }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          その他
        </Heading>
        <VStack align="stretch" gap={3}>

          {/* 未読バッジのためだけにクライアント側。見た目は下の NavRow と揃えてある */}
          <AnnouncementsNavRow items={announcements} accountCreatedAt={accountCreatedAt} />

          <Separator borderColor="var(--divider)" />

          {/*
            ⚠️ **URL が未設定のあいだは何も描かない**（appStore.js の hasAppStoreLink）。
               App ID が分かる前にデプロイしても壊れたリンクが出ないようにしてある。
          */}
          {hasAppStoreLink() && (
            <ExtRow
              href={APP_STORE_URL}
              icon={<Icon.LuSmartphone size={20} />}
              label="iPhone アプリ"
              description="App Store で入手できます"
            />
          )}

          <NavRow
            href="/settings/log"
            icon={<Icon.LuHistory size={20} />}
            label="アクションログ"
            description="操作履歴を確認できます"
          />

          <Separator borderColor="var(--divider)" />

          <NavRow
            href="/settings/feedback"
            icon={<Icon.BiMessageSquareDetail size={20} />}
            label="フィードバック"
            description="バグ報告・機能の提案はこちら"
          />
          <NavRow
            href="/help"
            icon={<Icon.LuInfo size={20} />}
            label="ヘルプ・使い方"
            description="各ページの説明と操作手順"
          />

          <Separator borderColor="var(--divider)" />

          <NavRow
            href="/terms"
            icon={<Icon.LuFileText size={20} />}
            label="利用規約"
            description={null}
          />
          <NavRow
            href="/privacy"
            icon={<Icon.LuFileText size={20} />}
            label="プライバシーポリシー"
            description={null}
          />
          <NavRow
            href="/tokushoho"
            icon={<Icon.LuFileText size={20} />}
            label="特定商取引法に基づく表記"
            description={null}
          />

          <Separator borderColor="var(--divider)" />

          <form action="/api/auth/logout" method="post">
            <Button
              type="submit" w="full" py={3.5} px={6}
              fontSize="md" fontWeight="semibold"
              bg="var(--card-bg, #FFFFFF)" color="red.500"
              border="2px solid" borderColor="red.400"
              borderRadius="lg" cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "red.50" }} _active={{ bg: "red.100" }}
            >
              サインアウト
            </Button>
          </form>

          {/*
            App Store Guideline 5.1.1(v)：アプリ内から削除を開始できること。
            iOS 版もサインアウトの直下に置いてある（coinlaundy_app_iOS/app/settings/index.tsx）。
            ⚠️ **サインアウトより目立たせないこと。** 押し間違いを避けるため、
               塗りつぶしの赤ボタンにはしない。実際の削除は次のページで
               本人確認・チェック・確認ダイアログを通る。
          */}
          <Link href="/settings/delete-account" style={{ width: "100%" }}>
            <Button
              w="full" py={3} px={6}
              fontSize="sm" fontWeight="medium"
              bg="transparent" color="var(--text-muted, #64748B)"
              border="none" borderRadius="lg"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "red.50", color: "red.500" }}
            >
              アカウントを削除
            </Button>
          </Link>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
