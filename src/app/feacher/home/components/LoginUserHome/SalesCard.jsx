"use client";

import { Box, HStack, Text, VStack, Badge } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import * as Icon from "@/app/feacher/Icon";
import MonthFundTotal from "./MonthFundTotal";

const SalesCard = ({ id }) => {
  const [month, setMonth] = useState("");

  useEffect(() => {
    setMonth(`${new Date().getMonth() + 1}月`);
  }, []);

  return (
    <Box
      bg="#007BBB"
      p={{ base: 4, md: 6 }}
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="200px"
        h="200px"
        bg="white"
        opacity={0.05}
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-5%"
        w="150px"
        h="150px"
        bg="white"
        opacity={0.05}
        borderRadius="full"
      />

      <VStack align="stretch" gap={3} position="relative">
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon.LuTrendingUp color="white" size={24} />
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="white"
              fontWeight="semibold"
            >
              今月の売上
            </Text>
          </HStack>
          <Badge
            bg="whiteAlpha.300"
            color="white"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {month}
          </Badge>
        </HStack>

        <MonthFundTotal id={id} />

        <Text fontSize="xs" color="whiteAlpha.800" mt={1}>
          前月比較や詳細は「収益」から確認できます
        </Text>
      </VStack>
    </Box>
  );
};

export default SalesCard;
