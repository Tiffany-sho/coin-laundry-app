"use client";
import {
  Box,
  Button,
  Card,
  Field,
  Input,
  VStack,
  Heading,
  Separator,
  HStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";
import { useUserProfile } from "./useUserProfile";

const ROLE_LABEL = {
  admin:     "店舗管理者",
  collecter: "集金担当者",
  viewer:    "閲覧者",
};

export default function AccountForm({ user, myRole }) {
  const { loading, fullname, username, setFullname, setUsername, handleUpdate } =
    useUserProfile();

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <Card.Root
        bg="white"
        borderRadius="xl"
        p={{ base: 6, md: 8 }}
        boxShadow="var(--shadow-sm)"
        border="1px solid"
        borderColor="cyan.100"
      >
        <Flex justify="space-between" align="center" mb={8}>
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="var(--teal-deeper, #155E75)"
          >
            マイページ
          </Heading>
          <Link href="/account/log">
            <Button
              size="sm"
              variant="outline"
              borderColor="cyan.100"
              color="var(--teal, #0891B2)"
              fontWeight="semibold"
              borderRadius="lg"
              gap={2}
              _hover={{
                bg: "var(--teal-pale, #CFFAFE)",
                borderColor: "cyan.300",
              }}
            >
              <Icon.LuHistory size={16} />
              ログ確認
            </Button>
          </Link>
        </Flex>

        <VStack align="stretch" gap={6}>
          <Field.Root>
            <Field.Label
              htmlFor="email"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="var(--text-main, #1E3A5F)"
            >
              メールアドレス
            </Field.Label>
            <Input
              id="email"
              type="text"
              value={user?.email || ""}
              disabled
              bg="var(--app-bg, #F0F9FF)"
              color="var(--text-muted, #64748B)"
              cursor="not-allowed"
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              _focus={{ outline: "none" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="fullName"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="var(--text-main, #1E3A5F)"
            >
              氏名
            </Field.Label>
            <Input
              id="fullName"
              type="text"
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              transition="all 0.2s"
              _focus={{
                outline: "none",
                borderColor: "var(--teal, #0891B2)",
                boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.1)",
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="username"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="var(--text-main, #1E3A5F)"
            >
              ユーザー名
            </Field.Label>
            <Input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              transition="all 0.2s"
              _focus={{
                outline: "none",
                borderColor: "var(--teal, #0891B2)",
                boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.1)",
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="role"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="var(--text-main, #1E3A5F)"
            >
              役割
            </Field.Label>
            <Input
              id="role"
              type="text"
              value={ROLE_LABEL[myRole] ?? "閲覧者"}
              disabled
              bg="var(--app-bg, #F0F9FF)"
              color="var(--text-muted, #64748B)"
              cursor="not-allowed"
              border="1px solid"
              borderColor="cyan.100"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              _focus={{ outline: "none" }}
            />
          </Field.Root>

          <Button
            w="full"
            py={3.5}
            px={6}
            fontSize="md"
            fontWeight="semibold"
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white"
            border="none"
            borderRadius="lg"
            cursor="pointer"
            transition="all 0.2s"
            onClick={handleUpdate}
            disabled={loading}
            boxShadow="0 4px 14px rgba(8,145,178,0.28)"
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
            _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            {loading ? "更新中..." : "更新"}
          </Button>

          <Separator my={4} borderColor="var(--divider, #F1F5F9)" />

          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted, #64748B)" mb={2}>
              その他の操作
            </Text>

            <Link href="/account/log">
              <Box
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="cyan.100"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  bg: "var(--teal-pale, #CFFAFE)",
                  borderColor: "cyan.300",
                  transform: "translateX(2px)",
                }}
              >
                <HStack justify="space-between">
                  <HStack gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      bg="var(--teal-pale, #CFFAFE)"
                      borderRadius="lg"
                      align="center"
                      justify="center"
                      color="var(--teal, #0891B2)"
                    >
                      <Icon.LuHistory size={20} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                        アクションログ
                      </Text>
                      <Text fontSize="xs" color="var(--text-muted, #64748B)">
                        操作履歴を確認できます
                      </Text>
                    </Box>
                  </HStack>
                  <Icon.LuChevronRight color="var(--text-faint, #94A3B8)" />
                </HStack>
              </Box>
            </Link>
          </VStack>

          <Separator my={2} borderColor="var(--divider, #F1F5F9)" />

          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              w="full"
              py={3.5}
              px={6}
              fontSize="md"
              fontWeight="semibold"
              bg="white"
              color="red.500"
              border="2px solid"
              borderColor="red.400"
              borderRadius="lg"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ bg: "red.50" }}
              _active={{ bg: "red.100" }}
            >
              サインアウト
            </Button>
          </form>
        </VStack>
      </Card.Root>
    </Box>
  );
}
