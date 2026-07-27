"use client";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import JoinOrgForm from "@/app/feacher/settings/components/JoinOrgForm";
import OtherActionsCard from "@/app/feacher/settings/components/OtherActionsCard";

const roleLabel = {
  collecter: "集金担当者",
  viewer: "閲覧者",
};

const JoinOrganizationHome = ({ username, role }) => {
  return (
    <Flex
      minH="100dvh"
      justify="center"
      bg="var(--app-bg, #F0F9FF)"
      p={{ base: 4, md: 8 }}
    >
      {/* align="center" だと内容が画面より高いとき上端が見切れるため、
          my="auto" で中央寄せする（収まらない場合は上詰めになる） */}
      <Box maxW="480px" w="full" my="auto">
        <VStack gap={4} align="stretch">
          {/* ヘッダーカード */}
          <Box
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="var(--shadow-hero)"
          >
            <Box
              style={{
                background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)",
              }}
              p={{ base: 6, md: 8 }}
              textAlign="center"
            >
              <Flex
                w="64px"
                h="64px"
                borderRadius="2xl"
                bg="rgba(255,255,255,0.2)"
                align="center"
                justify="center"
                mx="auto"
                mb={4}
              >
                <Icon.LuUsers size={32} color="white" />
              </Flex>
              <Heading fontSize="xl" color="white" mb={1}>
                組織への参加
              </Heading>
              <Text fontSize="sm" color="rgba(255,255,255,0.8)">
                管理者から共有された情報を入力してください
              </Text>
            </Box>

            {/* ユーザー情報 */}
            <Box bg="white" px={{ base: 5, md: 6 }} py={4}>
              <Flex align="center" gap={3}>
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  bg="cyan.100"
                  align="center"
                  justify="center"
                  color="var(--teal)"
                  flexShrink={0}
                >
                  <Icon.LuUser size={16} />
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                    @{username}
                  </Text>
                  <Text fontSize="xs" color="var(--text-muted)">
                    {roleLabel[role] ?? role}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* 組織参加フォーム */}
          <JoinOrgForm />

          {/* 設定ページと同じ「その他」（この画面にはボトムナビが出ないため、
              ヘルプ・規約・サインアウトへの導線をここに置く）。
              サインアウトボタンもこのカードに含まれる。 */}
          <OtherActionsCard />
        </VStack>
      </Box>
    </Flex>
  );
};

export default JoinOrganizationHome;
