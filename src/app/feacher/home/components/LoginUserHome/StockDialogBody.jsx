"use client";

import { useState } from "react";
import { Box, Button, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import NowLaundryNum from "@/app/feacher/coinLandry/components/NowLaundryNum";
import MachinesState from "@/app/feacher/coinLandry/components/MachinesState";

const StockDialogBody = ({ data }) => {
  const [selectedStore, setSelectedStore] = useState(null);

  if (selectedStore) {
    return (
      <VStack align="stretch" gap={4}>
        <Button
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          onClick={() => setSelectedStore(null)}
        >
          <HStack gap={1}>
            <Icon.LuChevronLeft size={16} />
            <Text>店舗一覧に戻る</Text>
          </HStack>
        </Button>
        <Text fontSize="lg" fontWeight="bold" textAlign="center" color="gray.800">
          {selectedStore.store}店
        </Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
          <NowLaundryNum id={selectedStore.id} />
          <MachinesState id={selectedStore.id} />
        </Grid>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={3}>
      {data.map((item) => (
        <Box
          key={item.id}
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: "blue.50",
            borderColor: "blue.300",
            transform: "translateX(4px)",
            boxShadow: "md",
          }}
          onClick={() => setSelectedStore(item)}
        >
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            color="gray.800"
          >
            {item.store}店
          </Text>
        </Box>
      ))}
    </VStack>
  );
};

export default StockDialogBody;
