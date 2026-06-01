import { Card, Button, HStack, Text, Box, Flex, Heading, VStack, Separator } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

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

export default function OtherActionsCard() {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          その他
        </Heading>
        <VStack align="stretch" gap={3}>

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
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
