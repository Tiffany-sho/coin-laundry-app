import {
  changeEpocFromNextYearMonth,
  changeEpocFromNowYearMonth,
} from "@/date";
import { createClient } from "@/utils/supabase/server";

const getData = async (id) => {
  const supabase = await createClient();

  const epocYearMonth = changeEpocFromNowYearMonth();
  const epocYearNextMonth = changeEpocFromNextYearMonth();

  const { data, error } = await supabase
    .from("collect_funds")
    .select("*")
    .eq("collecter", id)
    .gt("date", epocYearMonth)
    .lt("date", epocYearNextMonth);

  if (error) {
    return {
      error: error.message,
    };
  }

  return { data: data };
};
const MonthFundTotal = async ({ id }) => {
  const { data, error } = await getData(id);
  if (error) {
    return <div>データ取得失敗</div>;
  }
  if (!data || data.length === 0) {
    return <div>データがありません</div>;
  }

  const totalRevenue = data.reduce((accumulator, current) => {
    const summary = current.fundsArray.reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.funds);
    }, 0);
    return accumulator + summary;
  }, 0);
  return <div>今月の売上{totalRevenue}</div>;
};

export default MonthFundTotal;
