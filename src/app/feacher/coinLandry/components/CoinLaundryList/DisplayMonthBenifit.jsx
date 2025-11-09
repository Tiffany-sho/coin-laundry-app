// ============================================
import { createNowData, getYearMonth } from "@/date";
import { createClient } from "@/utils/supabase/server";
import { Text, VStack } from "@chakra-ui/react";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";

const getData = async (id) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collect_funds")
    .select("date,fundsArray")
    .eq("laundryId", id);

  if (error) {
    return {
      error: error.message,
    };
  }

  return { data: data };
};

const DisplayMonthBenifit = async ({ id }) => {
  const { data, error } = await getData(id);
  if (error) return <ErrorPage title={error.msg} status={error.status} />;

  const nowDate = getYearMonth(Date.now());
  const monthData = data.filter((item) => getYearMonth(item.date) === nowDate);

  const monthBenefit =
    monthData.reduce((accumulator, currentValue) => {
      return (
        accumulator +
        currentValue.fundsArray.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.funds;
        }, 0)
      );
    }, 0) * 100;

  const lastestDate = data.reduce((max, current) => {
    return current.date > max ? current.date : max;
  }, 0);

  return (
    <VStack align="stretch" gap={1}>
      <Text fontSize="xs" color="gray.600" fontWeight="medium">
        今月の売上
      </Text>
      <Text fontSize="xl" fontWeight="bold" color="blue.700">
        ¥{monthBenefit.toLocaleString()}
      </Text>
      <Text fontSize="xs" color="gray.500" mt={1}>
        最終回収: {createNowData(lastestDate)}
      </Text>
    </VStack>
  );
};

export default DisplayMonthBenifit;
