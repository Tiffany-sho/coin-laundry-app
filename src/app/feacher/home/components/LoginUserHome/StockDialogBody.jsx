"use client";

import { useCallback, useState } from "react";
import { Box, Center, Grid, Spinner, Text, VStack } from "@chakra-ui/react";
import NowLaundryNum from "@/app/feacher/coinLandry/components/NowLaundryNum";
import MachinesState from "@/app/feacher/coinLandry/components/MachinesState";

const StockDialogBody = ({ data }) => {
  const total = data.length * 2; // 店舗ごとに NowLaundryNum + MachinesState
  const [loadedCount, setLoadedCount] = useState(0);

  const handleLoad = useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  const isLoading = loadedCount < total;

  return (
    <>
      {isLoading && (
        <Center py={8}>
          <VStack gap={3}>
            <Spinner size="lg" color="blue.500" />
            <Text fontSize="sm" color="gray.500">
              読み込み中...
            </Text>
          </VStack>
        </Center>
      )}

      {/* ロード完了まで非表示だが、マウントしてデータ取得を進める */}
      <VStack
        align="stretch"
        gap={3}
        visibility={isLoading ? "hidden" : "visible"}
        h={isLoading ? "0" : "auto"}
        overflow={isLoading ? "hidden" : "visible"}
      >
        {data.map((item) => (
          <Box key={item.id}>
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color="gray.700"
              textAlign="center"
              my={3}
            >
              {item.store}店
            </Text>
            <Grid templateColumns="repeat(2,1fr)" gap={3} mt={2}>
              <NowLaundryNum id={item.id} onLoad={handleLoad} />
              <MachinesState id={item.id} onLoad={handleLoad} />
            </Grid>
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default StockDialogBody;
