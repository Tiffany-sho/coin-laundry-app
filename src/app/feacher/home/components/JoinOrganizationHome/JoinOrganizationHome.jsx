"use client";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const roleLabel = {
  collecter: "集金担当者",
  viewer: "閲覧者",
};

const JoinOrganizationHome = ({ username, role }) => {
  return (
    <Flex
      minH="100dvh"
      align="center"
      justify="center"
      bg="var(--app-bg, #F0F9FF)"
      p={{ base: 4, md: 8 }}
    >
      <Box
        maxW="480px"
        w="full"
        bg="var(--card-bg, #FFFFFF)"
        borderRadius="2xl"
        boxShadow="var(--shadow-hero)"
        overflow="hidden"
      >
        {/* ヘッダー */}
        <Box
          style={{
            background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)",
          }}
          p={{ base: 6, md: 8 }}
          textAlign="center"
        >
          <Flex
            w="72px"
            h="72px"
            borderRadius="2xl"
            bg="rgba(255,255,255,0.2)"
            align="center"
            justify="center"
            mx="auto"
            mb={4}
          >
            <Icon.LuUsers size={36} color="white" />
          </Flex>
          <Heading fontSize="xl" color="white" mb={1}>
            組織への参加を待っています
          </Heading>
          <Text fontSize="sm" color="rgba(255,255,255,0.8)">
            管理者から招待リンクが届いたら参加できます
          </Text>
        </Box>

        {/* ボディ */}
        <VStack gap={5} p={{ base: 6, md: 8 }} align="stretch">
          {/* ユーザー情報 */}
          <Box
            p={4}
            borderRadius="xl"
            border="1.5px solid"
            borderColor="cyan.100"
            bg="var(--app-bg)"
          >
            <Text fontSize="xs" color="var(--text-muted)" mb={3} fontWeight="semibold" letterSpacing="0.05em">
              アカウント情報
            </Text>
            <Flex align="center" gap={3}>
              <Flex
                w="40px"
                h="40px"
                borderRadius="full"
                bg="cyan.100"
                align="center"
                justify="center"
                color="var(--teal)"
                flexShrink={0}
              >
                <Icon.LuUser size={18} />
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

          {/* 手順 */}
          <VStack align="stretch" gap={3}>
            {[
              {
                icon: <Icon.LuMail size={16} />,
                text: "店舗管理者に招待リンクの送付を依頼する",
              },
              {
                icon: <Icon.LuSmartphone size={16} />,
                text: "届いたリンクをタップして組織に参加する",
              },
              {
                icon: <Icon.LuCheck size={16} />,
                text: "参加後はホーム画面で集金・管理ができます",
              },
            ].map(({ icon, text }, i) => (
              <Flex key={i} align="flex-start" gap={3}>
                <Flex
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="var(--teal-pale)"
                  align="center"
                  justify="center"
                  color="var(--teal)"
                  flexShrink={0}
                  mt="1px"
                >
                  {icon}
                </Flex>
                <Text fontSize="sm" color="var(--text-main)" lineHeight="1.6" pt="3px">
                  {text}
                </Text>
              </Flex>
            ))}
          </VStack>

          {/* 補足 */}
          <Box
            p={4}
            bg="var(--app-bg)"
            borderRadius="xl"
            border="1px solid"
            borderColor="var(--divider)"
          >
            <Flex align="flex-start" gap={2}>
              <Box color="var(--teal)" flexShrink={0} mt="1px">
                <Icon.CiCircleAlert size={16} />
              </Box>
              <Text fontSize="xs" color="var(--text-muted)" lineHeight="1.7">
                まだ組織に参加していないため、集金記録や店舗管理は行えません。
                管理者から招待を受け取ったらリンクをクリックして参加してください。
              </Text>
            </Flex>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default JoinOrganizationHome;
