"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { requestJoinOrg } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export default function JoinOrgForm() {
  const [adminEmail, setAdminEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !joinPassword.trim()) return;

    setLoading(true);
    setError(null);

    const { error: err } = await requestJoinOrg(adminEmail.trim(), joinPassword.trim());

    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Card.Root
        w="full"
        bg="var(--card-bg, #FFFFFF)"
        borderRadius="xl"
        boxShadow="var(--shadow-sm)"
        border="1px solid"
        borderColor="cyan.100"
      >
        <Card.Body p={{ base: 5, md: 6 }}>
          <VStack align="center" gap={3} py={4} textAlign="center">
            <Box bg="var(--teal, #0891B2)" color="white" borderRadius="full" p={2}>
              <Icon.LuCheck size={20} />
            </Box>
            <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
              組織への参加が完了しました
            </Heading>
            <Text fontSize="sm" color="var(--text-muted)">
              集金担当者としてメンバー登録されました。ページを再読み込みしてください。
            </Text>
            <Button
              size="sm"
              colorPalette="cyan"
              borderRadius="full"
              onClick={() => window.location.reload()}
            >
              <Icon.LuRefreshCw size={14} />
              再読み込み
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack gap={2} mb={5}>
          <Box color="var(--teal)">
            <Icon.LuBuilding2 size={18} />
          </Box>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            組織に参加する
          </Heading>
        </HStack>

        <Text fontSize="sm" color="var(--text-muted)" mb={4}>
          管理者のメールアドレスと組織パスワードを入力してください。管理者から事前に共有を受けてください。
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={4}>
            <VStack align="stretch" gap={1.5}>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
                管理者のメールアドレス
              </Text>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                borderRadius="lg"
                borderColor="cyan.100"
                _focusVisible={{ borderColor: "cyan.400" }}
                required
              />
            </VStack>

            <VStack align="stretch" gap={1.5}>
              <Text fontSize="xs" fontWeight="semibold" color="var(--text-muted)">
                組織パスワード
              </Text>
              <Input
                type="password"
                placeholder="管理者から共有されたパスワード"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                borderRadius="lg"
                borderColor="cyan.100"
                _focusVisible={{ borderColor: "cyan.400" }}
                required
              />
            </VStack>

            {error && (
              <HStack gap={1.5} color="red.500" fontSize="sm">
                <Icon.LuX size={14} />
                <Text>{error}</Text>
              </HStack>
            )}

            <Button
              type="submit"
              colorPalette="cyan"
              borderRadius="full"
              fontWeight="semibold"
              loading={loading}
              loadingText="確認中..."
              w="full"
            >
              <Icon.LuUserCheck size={16} />
              参加する
            </Button>
          </VStack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
