import { changeEpocFromBackYearMonth, createNowData } from "@/date";
import {
  changeEpocFromNextYearMonth,
  changeEpocFromNowYearMonth,
} from "@/date";
import { createClient } from "@/utils/supabase/server";
import { Text, VStack, Box, HStack, Badge } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const getData = async (id) => {
  const supabase = await createClient();

  const epocYearBeforeMonth = changeEpocFromBackYearMonth();
  const epocYearAfterMonth = changeEpocFromNextYearMonth();

  const { data, error } = await supabase
    .from("collect_funds")
    .select("date,totalFunds")
    .eq("laundryId", id)
    .gt("date", epocYearBeforeMonth)
    .lt("date", epocYearAfterMonth);

  if (error) {
    return {
      error: error.message,
    };
  }

  if (data.length === 0) {
    const { data, error } = await supabase
      .from("collect_funds")
      .select("date,fundsArray")
      .eq("laundryId", id)
      .lt("date", epocYearBeforeMonth);

    if (error) {
      return {
        error: error.message,
      };
    }
    return { data: data };
  }

  return { data: data };
};

const DisplayMonthBenifit = async ({ id }) => {
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;
  const epocYearMonth = changeEpocFromNowYearMonth();
  const epocYearBeforeMonth = changeEpocFromBackYearMonth();
  const epocYearAfterMonth = changeEpocFromNextYearMonth();

  const thisMonthBenefit = data
    .filter(
      (item) => item.date >= epocYearMonth && item.date < epocYearAfterMonth
    )
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalFunds;
    }, 0);

  const lastMonthBenefit = data
    .filter(
      (item) => item.date < epocYearMonth && item.date >= epocYearBeforeMonth
    )
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalFunds;
    }, 0);

  const lastestDate = data.reduce((max, current) => {
    return current.date > max ? current.date : max;
  }, 0);

  const difference = thisMonthBenefit - lastMonthBenefit;
  const percentageChange =
    lastMonthBenefit > 0
      ? ((difference / lastMonthBenefit) * 100).toFixed(1)
      : 0;

  const isIncrease = difference > 0;
  const isDecrease = difference < 0;
  const isEqual = difference === 0;

  return (
    <VStack align="stretch" gap={3}>
      <Box>
        <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={1}>
          今月の売上
        </Text>
        <HStack align="baseline" gap={2}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={
              isIncrease ? "green.700" : isDecrease ? "red.700" : "blue.700"
            }
          >
            ¥{thisMonthBenefit.toLocaleString()}
          </Text>
          {!isEqual && (
            <Badge
              bg={isIncrease ? "green.200" : "red.200"}
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={1}
            >
              {isIncrease ? (
                <Icon.LuTrendingUp size={12} />
              ) : (
                <Icon.LuTrendingDown size={12} />
              )}
              {isIncrease ? "+" : ""}
              {percentageChange}%
            </Badge>
          )}
          {isEqual && (
            <Badge
              bg="gray.200"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon.LuMinus size={12} />
              変動なし
            </Badge>
          )}
        </HStack>
      </Box>

      <Box>
        <VStack align="stretch" gap={2}>
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="2xs" color="gray.500" fontWeight="medium">
                今月
              </Text>
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                ¥{thisMonthBenefit.toLocaleString()}
              </Text>
            </HStack>
            <Box h="8px" bg="gray.100" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                bg={
                  isIncrease ? "green.400" : isDecrease ? "red.400" : "blue.400"
                }
                borderRadius="full"
                w={`${Math.min(
                  100,
                  (thisMonthBenefit /
                    Math.max(thisMonthBenefit, lastMonthBenefit)) *
                    100
                )}%`}
                transition="width 0.5s ease"
              />
            </Box>
          </Box>

          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="2xs" color="gray.500" fontWeight="medium">
                先月
              </Text>
              <Text fontSize="2xs" color="gray.500" fontWeight="bold">
                ¥{lastMonthBenefit.toLocaleString()}
              </Text>
            </HStack>
            <Box h="8px" bg="gray.100" borderRadius="full" overflow="hidden">
              <Box
                h="100%"
                bg="blue.300"
                borderRadius="full"
                w={`${Math.min(
                  100,
                  (lastMonthBenefit /
                    Math.max(thisMonthBenefit, lastMonthBenefit)) *
                    100
                )}%`}
                transition="width 0.5s ease"
              />
            </Box>
          </Box>
        </VStack>
      </Box>

      {!isEqual && (
        <Box
          p={2}
          bg={isIncrease ? "green.50" : "red.50"}
          borderRadius="md"
          border="1px solid"
          borderColor={isIncrease ? "green.200" : "red.200"}
        >
          <Text
            fontSize="xs"
            color={isIncrease ? "green.700" : "red.700"}
            fontWeight="semibold"
            textAlign="center"
          >
            {isIncrease ? "+" : ""}¥{Math.abs(difference).toLocaleString()}
            {isIncrease ? " の増加" : " の減少"}
          </Text>
        </Box>
      )}

      <Text fontSize="xs" color="gray.500" mt={1}>
        {lastestDate !== 0 && `最終回収: ${createNowData(lastestDate)}`}
      </Text>
    </VStack>
  );
};

export default DisplayMonthBenifit;
