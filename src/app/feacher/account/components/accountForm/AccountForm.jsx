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
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

export default function AccountForm({ user }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(null);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
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

  async function updateProfile({ username, website, avatarUrl }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        full_name: fullname,
        username,
        website,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toaster.create({
        description: "プロフィールを更新しました",
        type: "success",
        closable: true,
      });
    } catch (error) {
      toaster.create({
        description: "プロフィール更新に失敗しました",
        type: "error",
        closable: true,
      });
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
      >
        <Heading
          as="h1"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          mb={8}
          color="gray.800"
        >
          マイページ
        </Heading>

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
              htmlFor="website"
              fontSize="sm"
              fontWeight="semibold"
              mb={2}
              color="gray.700"
            >
              ウェブサイト
            </Field.Label>
            <Input
              id="website"
              type="url"
              value={website || ""}
              onChange={(e) => setWebsite(e.target.value)}
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
            onClick={() => updateProfile({ fullname, username, website })}
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
