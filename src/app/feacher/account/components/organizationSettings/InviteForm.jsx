"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Field,
  Spinner,
  NativeSelect,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { inviteMember } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { showToast } from "@/functions/makeToast/toast";

export default function InviteForm({ orgName, inviterName, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("collecter");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);

    const { data, error } = await inviteMember(email, role);
    if (error) {
      showToast("error", error);
      setLoading(false);
      return;
    }

    const inviteUrl = `${window.location.origin}/auth/invite/${data.token}`;
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, orgName, inviterName, role, inviteUrl }),
    });

    if (!res.ok) {
      const resJson = await res.json().catch(() => ({}));
      showToast("error", resJson.detail ? `招待メールの送信に失敗しました: ${resJson.detail}` : "招待メールの送信に失敗しました");
    } else {
      showToast("success", `${email} に招待メールを送信しました`);
      setEmail("");
      onInvited?.();
    }
    setLoading(false);
  };

  return (
    <Box p={5} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
      <Text fontSize="sm" fontWeight="bold" color="blue.800" mb={4}>
        メンバーを招待
      </Text>
      <VStack align="stretch" gap={3}>
        <Field.Root>
          <Field.Label fontSize="xs" color="gray.600" mb={1}>
            メールアドレス
          </Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            bg="white"
            borderRadius="lg"
            fontSize="sm"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize="xs" color="gray.600" mb={1}>
            役割
          </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={role}
              onChange={(e) => setRole(e.target.value)}
              bg="white"
              borderRadius="lg"
              fontSize="sm"
            >
              <option value="collecter">集金担当者</option>
              <option value="viewer">閲覧者</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Button
          bg="blue.500"
          color="white"
          fontWeight="bold"
          borderRadius="lg"
          onClick={handleInvite}
          disabled={loading || !email}
          _hover={{ bg: "blue.600" }}
        >
          {loading ? <Spinner size="sm" /> : <Icon.LuMail size={16} />}
          &nbsp;招待メールを送信
        </Button>
      </VStack>
    </Box>
  );
}
