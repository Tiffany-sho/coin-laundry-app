"use client";

import { Button, HStack, RadioCard, Stack, VStack, Text } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const items = [
  {
    value: "admin",
    title: "店舗管理者",
    description: "店舗の登録・設定など、すべての操作が行えます",
  },
  {
    value: "collecter",
    title: "担当スタッフ",
    description: "集金データの登録・閲覧が行えます",
  },
];

const AuthorityChoose = () => {
  const { handleBack, handleNext, role, setRole } = useUploadProfiles();

  return (
    <VStack align="stretch" gap={6} w="full">
      <RadioCard.Root value={role} onValueChange={(e) => setRole(e.value)} size="lg">
        <RadioCard.Label fontSize="sm" fontWeight="semibold" color="var(--text-main)" mb={4}>
          あなたは店舗管理者ですか？
        </RadioCard.Label>
        <Stack justify="center" gap={3} flexDirection={{ base: "column", md: "row" }}>
          {items.map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
              display="flex"
              p={4}
              borderRadius="xl"
              border="2px solid"
              borderColor={role === item.value ? "cyan.400" : "var(--divider)"}
              bg={role === item.value ? "cyan.50" : "white"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: role === item.value ? "cyan.500" : "cyan.200",
                transform: "translateY(-2px)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemContent>
                  <RadioCard.ItemText
                    fontSize="md"
                    fontWeight="bold"
                    color={role === item.value ? "cyan.900" : "var(--text-main)"}
                    mb={1}
                  >
                    {item.title}
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription
                    fontSize="sm"
                    color={role === item.value ? "cyan.700" : "var(--text-muted)"}
                    lineHeight="1.5"
                  >
                    {item.description}
                  </RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator position="absolute" top={0} right={0} />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          ))}
        </Stack>
      </RadioCard.Root>

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
          onClick={handleNext}
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

export default AuthorityChoose;
