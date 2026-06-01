"use client";

import { Button, Field, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import { useState } from "react";

const UserUploadForm = () => {
  const [msg, setMsg] = useState("");
  const { handleNext, handleBack, username, fullname, setUsername, setFullname } = useUploadProfiles();

  const nextStep = () => {
    if (fullname === "" || username === "") {
      setMsg("空のフォームデータがあります");
    } else {
      handleNext();
    }
  };

  return (
    <VStack align="stretch" gap={5}>
      {msg && (
        <Text color="red.400" fontSize="sm" fontWeight="medium">
          {msg}
        </Text>
      )}

      <Field.Root>
        <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
          氏名
        </Field.Label>
        <Input
          type="text"
          value={fullname || ""}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="山田 太郎"
          border="1px solid"
          borderColor="var(--divider)"
          borderRadius="lg"
          py={3}
          px={4}
          fontSize="md"
          _focusVisible={{ borderColor: "cyan.400", boxShadow: "0 0 0 3px rgba(6,182,212,0.15)" }}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
          ユーザー名
        </Field.Label>
        <Input
          type="text"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yamada_taro"
          border="1px solid"
          borderColor="var(--divider)"
          borderRadius="lg"
          py={3}
          px={4}
          fontSize="md"
          _focusVisible={{ borderColor: "cyan.400", boxShadow: "0 0 0 3px rgba(6,182,212,0.15)" }}
        />
      </Field.Root>

      <HStack gap={3} w="full" mt={2}>
        <Button
          flex={1}
          size="lg"
          variant="outline"
          borderColor="var(--divider)"
          color="var(--text-muted)"
          fontWeight="semibold"
          borderRadius="xl"
          py={6}
          onClick={handleBack}
          _hover={{ bg: "gray.50", borderColor: "gray.300" }}
        >
          戻る
        </Button>
        <Button
          flex={1}
          size="lg"
          style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
          color="white"
          fontWeight="bold"
          borderRadius="xl"
          py={6}
          onClick={nextStep}
          boxShadow="0 4px 14px rgba(8,145,178,0.3)"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(8,145,178,0.5)" }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.2s"
        >
          次へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default UserUploadForm;
