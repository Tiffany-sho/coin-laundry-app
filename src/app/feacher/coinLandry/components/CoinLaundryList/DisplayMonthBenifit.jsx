import { createNowData } from "@/functions/makeDate/date";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/server";
import { Text, HStack, Badge, Stack, Box } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const getData = async (id) => {
  const supabase = await createClient();

  const epocYearBeforeMonth = changeEpocFromNowYearMonth(-1);
  const epocYearAfterMonth = changeEpocFromNowYearMonth(1);

  const { data, error } = await supabase
    .from("collect_funds")
    .select("date,totalFunds")
    .eq("laundryId", id)
    .gt("date", epocYearBeforeMonth)
    .lt("date", epocYearAfterMonth);

  if (error) {
    return {
      error: "集金データの取得に失敗しました",
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
        error: "集金データの取得に失敗しました",
      };
    }
    return { data: data };
  }

  return { data: data };
};

const DisplayMonthBenifit = async ({ id }) => {
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const epocYearMonth = changeEpocFromNowYearMonth(0);
  const epocYearBeforeMonth = changeEpocFromNowYearMonth(-1);
  const epocYearAfterMonth = changeEpocFromNowYearMonth(1);

  const thisMonthBenefit = data
    .filter(
      (item) => item.date >= epocYearMonth && item.date < epocYearAfterMonth,
    )
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalFunds;
    }, 0);

  const lastMonthBenefit = data
    .filter(
      (item) => item.date < epocYearMonth && item.date >= epocYearBeforeMonth,
    )
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue.totalFunds;
    }, 0);

  const difference = thisMonthBenefit - lastMonthBenefit;
  const percentageChange =
    lastMonthBenefit > 0
      ? ((difference / lastMonthBenefit) * 100).toFixed(1)
      : 0;
  const lastestDate = data.reduce((max, current) => {
    return current.date > max ? current.date : max;
  }, 0);

  const isIncrease = difference > 0;
  const isEqual = difference === 0;

  return (
    <Box
      p={5}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Stack spacing={4}>
        <HStack align="flex-start" justify="space-between" spacing={4}>
          <Stack spacing={2} flex={1}>
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              今月売上
            </Text>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color="gray.800"
              lineHeight="1.2"
            >
              ¥{thisMonthBenefit.toLocaleString()}
            </Text>
          </Stack>

          <Stack spacing={2} align="flex-end">
            {!isEqual && (
              <Badge
                bg={isIncrease ? "green.50" : "red.50"}
                color={isIncrease ? "green.700" : "red.700"}
                borderColor={isIncrease ? "green.200" : "red.200"}
                borderWidth="1px"
                fontSize="sm"
                fontWeight="semibold"
                px={3}
                py={1.5}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                {isIncrease ? (
                  <Icon.LuTrendingUp size={14} />
                ) : (
                  <Icon.LuTrendingDown size={14} />
                )}
                {isIncrease ? "+" : ""}
                {percentageChange}%
              </Badge>
            )}
            {isEqual && (
              <Badge
                bg="gray.100"
                color="gray.600"
                borderColor="gray.200"
                borderWidth="1px"
                fontSize="sm"
                fontWeight="semibold"
                px={3}
                py={1.5}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Icon.LuMinus size={14} />
                変動なし
              </Badge>
            )}
            <Text fontSize="xs" color="gray.500">
              前月比
            </Text>
          </Stack>
        </HStack>

        {lastestDate !== 0 && (
          <Text
            fontSize="xs"
            color="gray.500"
            pt={2}
            borderTopWidth="1px"
            borderColor="gray.100"
          >
            最終回収日: {createNowData(lastestDate)}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default DisplayMonthBenifit;
