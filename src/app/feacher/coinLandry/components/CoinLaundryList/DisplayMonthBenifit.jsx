import { createNowData } from "@/functions/makeDate/date";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";
import { createClient } from "@/utils/supabase/server";
import { Text, HStack, Badge, Stack } from "@chakra-ui/react";
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
    <Stack>
      <HStack align="baseline" gap={2} justify="space-between">
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="gray.700"
        >
          ¥{thisMonthBenefit.toLocaleString()}
        </Text>
        {!isEqual && (
          <Badge
            bg={isIncrease ? "green.100" : "red.100"}
            color={isIncrease ? "green.600" : "red.600"}
            borderColor={isIncrease ? "green.200" : "red.200"}
            borderWidth="0.5px"
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
      <Text fontSize="xs" color="gray.500" mt={1}>
        {lastestDate !== 0 && `最終回収日: ${createNowData(lastestDate)}`}
      </Text>
    </Stack>
  );
};

export default DisplayMonthBenifit;
