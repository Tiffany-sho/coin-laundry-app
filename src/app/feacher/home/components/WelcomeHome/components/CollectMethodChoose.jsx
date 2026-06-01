"use client";

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
  const { handleBack, handleNext, collectMethod, setCollectMethod } = useUploadProfiles();

  return (
    <VStack align="stretch" gap={6} w="full">
      <RadioCard.Root
        value={collectMethod}
        onValueChange={(e) => setCollectMethod(e.value)}
        size="lg"
      >
        <RadioCard.Label fontSize="sm" fontWeight="semibold" color="var(--text-main)" mb={4}>
          集金方法を選択してください
          <Text fontSize="2xs" color="var(--text-muted)" mt={1}>※設定後も変更できます</Text>
        </RadioCard.Label>
        <HStack align="stretch" gap={3} flexDirection={{ base: "column", md: "row" }}>
          {items.map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
              display="flex"
              p={4}
              borderRadius="xl"
              border="2px solid"
              borderColor={collectMethod === item.value ? "cyan.400" : "var(--divider)"}
              bg={collectMethod === item.value ? "cyan.50" : "white"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: collectMethod === item.value ? "cyan.500" : "cyan.200",
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
                    color={collectMethod === item.value ? "cyan.900" : "var(--text-main)"}
                    mb={1}
                  >
                    {item.title}
                  </RadioCard.ItemText>
                  <RadioCard.ItemDescription
                    fontSize="sm"
                    color={collectMethod === item.value ? "cyan.700" : "var(--text-muted)"}
                    lineHeight="1.5"
                  >
                    {item.description}
                  </RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator position="absolute" top={0} right={0} />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          ))}
        </HStack>
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

export default CollectMethodChoose;
