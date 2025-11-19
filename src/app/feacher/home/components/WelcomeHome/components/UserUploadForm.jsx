import { Button, Field, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";
import { useState } from "react";

const UserUploadForm = () => {
  const [msg, setMsg] = useState("");
  const {
    handleNext,
    handleBack,
    username,
    fullname,
    setUsername,
    setFullname,
  } = useUploadProfiles();

  const nextStep = () => {
    if (fullname === "" || username === "") {
      setMsg("空のフォームデータがあります");
    } else {
      handleNext();
    }
  };

  return (
    <VStack align="stretch" gap={6}>
      {msg && (
        <Text color="red.400" fontWeight="bold">
          {msg}
        </Text>
      )}
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

      <HStack gap={3} w="full">
        <Button
          flex={1}
          size="lg"
          variant="outline"
          borderColor="gray.300"
          color="gray.700"
          fontWeight="semibold"
          borderRadius="lg"
          py={6}
          onClick={handleBack}
          _hover={{
            bg: "gray.50",
          }}
        >
          戻る
        </Button>

        <Button
          flex={1}
          w={"auto"}
          size="lg"
          bg="blue.500"
          color="white"
          fontWeight="semibold"
          borderRadius="lg"
          py={6}
          onClick={nextStep}
          _hover={{
            bg: "blue.600",
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          transition="all 0.2s"
        >
          次へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default UserUploadForm;
