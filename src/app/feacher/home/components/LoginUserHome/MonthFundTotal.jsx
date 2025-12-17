import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/server";
import { HStack, Text, Box } from "@chakra-ui/react";

const getData = async (id) => {
  const supabase = await createClient();

  const epocYearMonth = changeEpocFromNowYearMonth(0);
  const epocYearNextMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("collecter", id)
    .gt("date", epocYearMonth)
    .lt("date", epocYearNextMonth);

  if (error) {
    return { error: "集金データの取得に失敗しました" };
  }

  return { data: data };
};

const MonthFundTotal = async ({ id }) => {
  const { data, error } = await getData(id);

  if (error) {
    return (
      <Box py={4}>
        <Text color="white" fontSize="sm">
          データ取得失敗
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box py={4}>
        <HStack align="baseline" gap={2}>
          <Text
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="extrabold"
            color="white"
          >
            ¥0
          </Text>
        </HStack>
        <Text fontSize="xs" color="whiteAlpha.700" mt={2}>
          今月の集金記録はまだありません
        </Text>
      </Box>
    );
  }

  const totalRevenue = data.reduce((accumulator, current) => {
    const summary = current.totalFunds;
    return accumulator + summary;
  }, 0);

  const collectCount = data.length;

  return (
    <Box py={2}>
      <HStack align="baseline" gap={2} flexWrap="wrap">
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="white"
        >
          ¥
        </Text>

        <Text
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="extrabold"
          color="white"
          lineHeight="1"
        >
          {totalRevenue.toLocaleString()}
        </Text>
      </HStack>

      <HStack gap={4} mt={3} flexWrap="wrap">
        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>
            集金回数
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            {collectCount}回
          </Text>
        </Box>

        <Box bg="whiteAlpha.200" px={3} py={1.5} borderRadius="md">
          <Text fontSize="2xs" color="whiteAlpha.800" mb={0.5}>
            平均単価
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="white">
            ¥{Math.round(totalRevenue / collectCount).toLocaleString()}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default MonthFundTotal;
