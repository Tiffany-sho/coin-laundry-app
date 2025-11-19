import { Button, HStack, RadioCard, VStack, Text } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const items = [
  {
    value: "machines",
    title: "機械別集金",
    description: "それぞれの機械の収益を記録します",
  },
  {
    value: "total",
    title: "まとめて集金",
    description: "総額の収益のみを記録します",
  },
];

const CollectMethodChoose = () => {
  const { handleBack, handleNext, collectMethod, setCollectMethod } =
    useUploadProfiles();

  return (
    <VStack align="stretch" gap={6} w="full">
      <RadioCard.Root
        value={collectMethod}
        onValueChange={(e) => setCollectMethod(e.value)}
        size="lg"
      >
        <RadioCard.Label
          fontSize="lg"
          fontWeight="semibold"
          color="gray.800"
          mb={4}
        >
          集金方法を選択してください
          <Text fontSize="2xs">※設定後も変更できます</Text>
        </RadioCard.Label>
        <HStack
          align="stretch"
          gap={4}
          flexDirection={{ base: "column", md: "row" }}
        >
          {items.map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
              display="flex"
              p={5}
              borderRadius="xl"
              border="2px solid"
              borderColor={
                collectMethod === item.value ? "blue.500" : "gray.200"
              }
              bg={collectMethod === item.value ? "blue.50" : "white"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor:
                  collectMethod === item.value ? "blue.600" : "gray.300",
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
                    color={
                      collectMethod === item.value ? "blue.900" : "gray.800"
                    }
                    mb={2}
                  >
                    {item.title}
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription
                    fontSize="sm"
                    color={
                      collectMethod === item.value ? "blue.700" : "gray.600"
                    }
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
        </HStack>
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
          次へ
        </Button>
      </HStack>
    </VStack>
  );
};

export default CollectMethodChoose;
