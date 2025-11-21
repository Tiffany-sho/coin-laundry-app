import { getFundsData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { Text, VStack } from "@chakra-ui/react";

const MonoDataTotal = async ({ id }) => {
  const { data, error } = await getFundsData(id);

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
    <VStack align="stretch" gap={1}>
      <Text fontSize="2xl" fontWeight="bold" color="green.700">
        ¥{totalRevenue.toLocaleString()}
      </Text>
      <Text fontSize="xs" color="gray.500">
        累計 {data.length}回の集金
      </Text>
    </VStack>
  );
};

export default MonoDataTotal;
