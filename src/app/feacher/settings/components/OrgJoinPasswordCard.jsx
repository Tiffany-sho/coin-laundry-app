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
import { setOrgJoinPassword } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export default function OrgJoinPasswordCard({ currentPassword }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPassword ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await setOrgJoinPassword(value);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleCancel = () => {
    setValue(currentPassword ?? "");
    setEditing(false);
    setError(null);
  };

  const hasPassword = !!currentPassword;

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
        <HStack justify="space-between" mb={4}>
          <HStack gap={2}>
            <Box color="var(--teal)">
              <Icon.LuUserCheck size={16} />
            </Box>
            <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
              組織参加パスワード
            </Heading>
          </HStack>
          {!editing && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="cyan"
              borderRadius="lg"
              onClick={() => setEditing(true)}
            >
              <Icon.LuPencil size={13} />
              {hasPassword ? "変更" : "設定"}
            </Button>
          )}
        </HStack>

        <Text fontSize="sm" color="var(--text-muted)" mb={4}>
          このパスワードを共有したユーザーが設定ページから組織に参加できます。未設定の場合は参加リクエストを受け付けません。
        </Text>

        {!editing ? (
          <HStack
            px={4} py={3}
            bg="var(--app-bg, #F0F9FF)"
            borderRadius="lg"
            border="1px solid"
            borderColor="cyan.100"
            gap={2}
          >
            <Icon.LuEyeOff size={14} color="var(--text-faint)" />
            <Text fontSize="sm" color={hasPassword ? "var(--text-main)" : "var(--text-faint)"}>
              {hasPassword ? "••••••••" : "未設定"}
            </Text>
            {saved && (
              <HStack gap={1} ml="auto" color="var(--teal)">
                <Icon.LuCheck size={13} />
                <Text fontSize="xs" fontWeight="semibold">保存済み</Text>
              </HStack>
            )}
          </HStack>
        ) : (
          <VStack align="stretch" gap={3}>
            <Input
              type="text"
              placeholder="例: laundry2024"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              borderRadius="lg"
              borderColor="cyan.100"
              _focusVisible={{ borderColor: "cyan.400" }}
              autoFocus
            />
            <Text fontSize="xs" color="var(--text-faint)">
              空欄で保存すると参加パスワードを削除します。
            </Text>
            {error && (
              <HStack gap={1.5} color="red.500" fontSize="sm">
                <Icon.LuX size={14} />
                <Text>{error}</Text>
              </HStack>
            )}
            <HStack gap={2} justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                colorPalette="cyan"
                borderRadius="full"
                onClick={handleCancel}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                colorPalette="cyan"
                borderRadius="full"
                fontWeight="semibold"
                loading={loading}
                loadingText="保存中..."
                onClick={handleSave}
              >
                <Icon.LuCheck size={14} />
                保存
              </Button>
            </HStack>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
