import { Button, HStack, RadioCard, Stack, VStack } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const items = [
  {
    value: "owner",
    title: "店舗管理者",
    description: "すべての権限が許可されています",
  },
  {
    value: "collecter",
    title: "集金担当者",
    description: "集金データを登録できます",
  },
  {
    value: "viewer",
    title: "閲覧者",
    description: "集金データを閲覧できます",
  },
];

const AuthorityChoose = () => {
  const { handleBack, handleNext, role, setRole } = useUploadProfiles();

  return (
    <VStack align="stretch" gap={6} w="full">
      <RadioCard.Root
        value={role}
        onValueChange={(e) => setRole(e.value)}
        size="lg"
      >
        <RadioCard.Label
          fontSize="lg"
          fontWeight="semibold"
          color="gray.800"
          mb={4}
        >
          あなたの役割を選択してください
        </RadioCard.Label>
        <Stack
          justify="center"
          gap={1}
          flexDirection={{ base: "column", md: "row" }}
        >
          {items.map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
              display="flex"
              p={1}
              borderRadius="xl"
              border="2px solid"
              borderColor={role === item.value ? "blue.500" : "gray.200"}
              bg={role === item.value ? "blue.50" : "white"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: role === item.value ? "blue.600" : "gray.300",
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemContent>
                  <RadioCard.ItemText
                    fontSize="md"
                    fontWeight="bold"
                    color={role === item.value ? "blue.900" : "gray.800"}
                    mb={2}
                  >
                    {item.title}
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription
                    fontSize="sm"
                    color={role === item.value ? "blue.700" : "gray.600"}
                    lineHeight="1.5"
                  >
                    {item.description}
                  </RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator
                  position="absolute"
                  top={0}
                  right={0}
                />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          ))}
        </Stack>
      </RadioCard.Root>

      <HStack gap={3} w="full" mt={4}>
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
          border="2px solid"
          _hover={{
            bg: "gray.50",
            borderColor: "gray.400",
          }}
          _disabled={{
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          戻る
        </Button>

        <Button
          flex={1}
          size="lg"
          bg="blue.500"
          color="white"
          fontWeight="semibold"
          borderRadius="lg"
          py={6}
          onClick={handleNext}
          _hover={{
            bg: "blue.600",
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          _active={{
            transform: "translateY(0)",
          }}
          _disabled={{
            opacity: 0.6,
            cursor: "not-allowed",
            transform: "none",
          }}
          transition="all 0.2s"
        >
          登録確認へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default AuthorityChoose;
