"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, HStack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

export default function CheckoutSuccessBanner() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/settings");
    }, 6000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      bg="green.50"
      border="1px solid"
      borderColor="green.200"
      borderRadius="xl"
      p={4}
    >
      <HStack gap={3}>
        <Icon.LuZap size={20} color="#16a34a" />
        <Text color="green.700" fontWeight="bold" fontSize="sm">
          プランのアップグレードが完了しました！
        </Text>
      </HStack>
      <Text color="green.600" fontSize="xs" mt={1} ml={8}>
        プランへの反映に数秒かかる場合があります。
      </Text>
    </Box>
  );
}
