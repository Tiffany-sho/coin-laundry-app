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
        <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper)">
          ¥0
        </Text>
        <Text fontSize="xs" color="var(--text-muted)">
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
      bg="var(--card-bg, #FFFFFF)"
      p={{ base: 5, md: 6 }}
      borderRadius="xl"
      border="1px solid"
      borderColor="cyan.100"
      boxShadow="var(--shadow-sm)"
    >
      <VStack align="stretch" gap={3}>
        <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted)">
          総売上
        </Text>
        <VStack align="stretch" gap={1}>
          <Text fontSize="3xl" fontWeight="bold" color="var(--teal-deeper)">
            ¥{totalRevenue.toLocaleString()}
          </Text>
          <Text fontSize="xs" color="var(--text-muted)">
            累計 {data.length}回の集金
          </Text>
          <Link href={`/coinLaundry/${coinLaundry.id}/coinDataList`}>
            <Button
              fontSize="xs"
              variant="outline"
              color="var(--teal, #0891B2)"
              borderColor="rgba(8,145,178,0.30)"
              _hover={{
                bg: "var(--teal-pale)",
                borderColor: "var(--teal, #0891B2)",
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
