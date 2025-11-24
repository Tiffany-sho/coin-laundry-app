"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { showToast } from "@/functions/makeToast/toast";
import Link from "next/link";

export default function AccountForm({ user }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, role`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setRole(data.role);
      }
    } catch (error) {
      alert("ユーザデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({ fullname, username }) {
    try {
      setLoading(true);

      if (fullname === "" || username === "") {
        throw new Error("空のフォームデータがあります");
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        full_name: fullname,
        username: username,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await showToast("success", "プロフィールを更新しました");
    } catch (error) {
      showToast("error", "プロフィールを更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <Card.Root
        bg="white"
        borderRadius="xl"
        p={{ base: 6, md: 8 }}
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Flex justify="space-between" align="center" mb={8}>
          <Heading
            as="h1"
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="gray.800"
          >
            マイページ
          </Heading>
          <Link href="/account/log">
            <Button
              size="sm"
              variant="outline"
              borderColor="gray.300"
              color="gray.700"
              fontWeight="semibold"
              borderRadius="lg"
              gap={2}
              _hover={{
                bg: "gray.50",
                borderColor: "gray.400",
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
              color="gray.700"
            >
              メールアドレス
            </Field.Label>
            <Input
              id="email"
              type="text"
              value={user?.email || ""}
              disabled
              bg="gray.50"
              color="gray.500"
              cursor="not-allowed"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              _focus={{
                outline: "none",
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="fullName"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="gray.700"
            >
              氏名
            </Field.Label>
            <Input
              id="fullName"
              type="text"
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              transition="all 0.2s"
              _focus={{
                outline: "none",
                borderColor: "blue.500",
                boxShadow: "0 0 0 3px rgba(49, 130, 206, 0.1)",
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="username"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="gray.700"
            >
              ユーザー名
            </Field.Label>
            <Input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              transition="all 0.2s"
              _focus={{
                outline: "none",
                borderColor: "blue.500",
                boxShadow: "0 0 0 3px rgba(49, 130, 206, 0.1)",
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label
              htmlFor="role"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="gray.700"
            >
              役割
            </Field.Label>
            <Input
              id="role"
              type="text"
              value={
                role === "owner"
                  ? "店舗管理者"
                  : role === "collecter"
                  ? "集金担当者"
                  : "閲覧者"
              }
              disabled
              bg="gray.50"
              color="gray.500"
              cursor="not-allowed"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              py={3}
              px={4}
              fontSize="md"
              _focus={{
                outline: "none",
              }}
            />
          </Field.Root>

          <Button
            w="full"
            py={3.5}
            px={6}
            fontSize="md"
            fontWeight="semibold"
            bg="blue.500"
            color="white"
            border="none"
            borderRadius="lg"
            cursor="pointer"
            transition="all 0.2s"
            onClick={() => updateProfile({ fullname, username })}
            disabled={loading}
            _hover={{
              bg: "blue.600",
            }}
            _active={{
              bg: "blue.700",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
            }}
          >
            {loading ? "更新中..." : "更新"}
          </Button>

          <Separator my={4} />

          {/* アクションセクション */}
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
              その他の操作
            </Text>

            <Link href="/account/log">
              <Box
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  bg: "gray.50",
                  borderColor: "blue.300",
                  transform: "translateX(2px)",
                }}
              >
                <HStack justify="space-between">
                  <HStack gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      bg="blue.50"
                      borderRadius="lg"
                      align="center"
                      justify="center"
                      color="blue.600"
                    >
                      <Icon.LuHistory size={20} />
                    </Flex>
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.800"
                      >
                        アクションログ
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        操作履歴を確認できます
                      </Text>
                    </Box>
                  </HStack>
                  <Icon.LuChevronRight color="#9CA3AF" />
                </HStack>
              </Box>
            </Link>
          </VStack>

          <Separator my={2} />

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
              borderColor="red.500"
              borderRadius="lg"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: "red.50",
              }}
              _active={{
                bg: "red.100",
              }}
            >
              サインアウト
            </Button>
          </form>
        </VStack>
      </Card.Root>
    </Box>
  );
}
