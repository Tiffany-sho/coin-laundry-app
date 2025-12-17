import { getFundsData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";

const MonoDataTotal = async ({ coinLaundry }) => {
  const { data, error } = await getFundsData(coinLaundry.id);

  if (error)
    return (
      <Text fontSize="sm" color="red.500" fontWeight="medium">
        データを入手できませんでした
      </Text>
    );

  if (!data || data.length === 0) {
    return (
      <VStack align="stretch" gap={1}>
        <Text fontSize="2xl" fontWeight="bold" color="green.700">
          ¥0
        </Text>
        <Text fontSize="xs" color="gray.500">
          集金データがありません
        </Text>
      </VStack>
    );
  }

  const totalRevenue = data.reduce((accumulator, current) => {
    const summary = current.totalFunds;
    return accumulator + summary;
  }, 0);

  return (
    <Box
      bg="white"
      p={{ base: 5, md: 6 }}
      borderRadius="16px"
      border="2px solid"
      borderColor="gray.200"
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
    >
      <VStack align="stretch" gap={3}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          総売上
        </Text>
        <VStack align="stretch" gap={1}>
          <Text fontSize="3xl" fontWeight="bold" color="green.700">
            ¥{totalRevenue.toLocaleString()}
          </Text>
          <Text fontSize="xs" color="gray.500">
            累計 {data.length}回の集金
          </Text>
          <Link href={`/coinLaundry/${coinLaundry.id}/coinDataList`}>
            <Button
              fontSize="xs"
              variant="outline"
              color="gray.600"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
            >
              <Icon.VscGraphLine />
              収益レポートへ
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
};

export default MonoDataTotal;
