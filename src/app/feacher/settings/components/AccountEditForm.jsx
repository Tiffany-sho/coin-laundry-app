"use client";

import { useRef } from "react";
import { Box, Button, Card, Field, Input, VStack, Heading, HStack, Text, Flex, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/feacher/account/components/accountForm/useUserProfile";
import * as Icon from "@/app/feacher/Icon";

function AvatarUploader({ avatarUrl, avatarLoading, username, onFileChange }) {
  const fileRef = useRef(null);
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <Flex direction="column" align="center" gap={3}>
      <Box position="relative" cursor="pointer" onClick={() => fileRef.current?.click()}>
        <Flex
          w="88px" h="88px"
          borderRadius="full"
          overflow="hidden"
          border="3px solid"
          borderColor="cyan.200"
          bg="var(--teal-pale)"
          align="center" justify="center"
          color="var(--teal)"
          fontSize="2xl" fontWeight="bold"
          flexShrink={0}
        >
          {avatarLoading ? (
            <Spinner size="md" color="var(--teal)" />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Text color="var(--teal-deeper)" fontSize="2xl" fontWeight="bold">{initial}</Text>
          )}
        </Flex>
        <Flex
          position="absolute" bottom="0" right="0"
          w="26px" h="26px"
          bg="var(--teal)" borderRadius="full"
          align="center" justify="center"
          border="2px solid white"
        >
          <Icon.LuCamera size={12} color="white" />
        </Flex>
      </Box>
      <Text fontSize="xs" color="var(--text-muted)">クリックして写真を変更</Text>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
          e.target.value = "";
        }}
      />
    </Flex>
  );
}

export default function AccountEditForm() {
  const router = useRouter();
  const {
    loading,
    fullname,
    username,
    avatarUrl,
    avatarLoading,
    setFullname,
    setUsername,
    handleUpdate,
    handleAvatarChange,
  } = useUserProfile({ onSuccess: () => router.push("/settings") });

  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 6, md: 8 }}>
        <HStack justify="space-between" mb={8}>
          <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
            アカウント編集
          </Heading>
          <Link href="/settings">
            <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
              _hover={{ color: "var(--text-main)" }}>
              <Icon.LuChevronLeft size={16} />
              <Text>戻る</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={6}>
          <AvatarUploader
            avatarUrl={avatarUrl}
            avatarLoading={avatarLoading}
            username={username}
            onFileChange={handleAvatarChange}
          />

          <Field.Root>
            <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
              氏名
            </Field.Label>
            <Input
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              border="1px solid" borderColor="cyan.100" borderRadius="lg"
              py={3} px={4} fontSize="md" transition="all 0.2s"
              _focusVisible={{ borderColor: "var(--teal)", boxShadow: "0 0 0 3px rgba(8,145,178,0.1)" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
              ユーザー名
            </Field.Label>
            <Input
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              border="1px solid" borderColor="cyan.100" borderRadius="lg"
              py={3} px={4} fontSize="md" transition="all 0.2s"
              _focusVisible={{ borderColor: "var(--teal)", boxShadow: "0 0 0 3px rgba(8,145,178,0.1)" }}
            />
          </Field.Root>

          <Button
            w="full" py={3.5} px={6} fontSize="md" fontWeight="semibold"
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white" border="none" borderRadius="lg" cursor="pointer" transition="all 0.2s"
            onClick={handleUpdate} disabled={loading}
            boxShadow="0 4px 14px rgba(8,145,178,0.28)"
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
            _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            {loading ? "更新中..." : "更新する"}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
