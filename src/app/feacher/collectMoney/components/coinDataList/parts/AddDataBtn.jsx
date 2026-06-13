import { Button } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { useState } from "react";
import { getStoreFundsInPeriod, getOrgCollectFundsInPeriod } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { changeEpocFromNowYearMonth } from "@/functions/makeDate/date";

const AddDataBtn = ({ id = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    tableMonthsBack,
    setTableMonthsBack,
    orderAmount,
    upOrder,
    setDisplayData,
    displayBtn,
    setDisplayBtn,
  } = useUploadPage();

  const addData = async () => {
    setIsLoading(true);

    try {
      const startEpoch = changeEpocFromNowYearMonth(-(tableMonthsBack + 2));
      const endEpoch = changeEpocFromNowYearMonth(-tableMonthsBack);

      let nextData;
      let nextError;

      if (id) {
        ({ data: nextData, error: nextError } = await getStoreFundsInPeriod(
          id,
          startEpoch,
          endEpoch,
          orderAmount,
          upOrder
        ));
      } else {
        ({ data: nextData, error: nextError } = await getOrgCollectFundsInPeriod(
          startEpoch,
          endEpoch,
          orderAmount,
          upOrder
        ));
      }

      if (nextError) {
        setDisplayData(null);
      } else {
        if (nextData.length === 0) {
          setDisplayBtn(false);
        } else {
          setDisplayData((prev) => [...prev, ...nextData]);
          setTableMonthsBack((prev) => prev + 2);
        }
      }
    } catch (error) {
      console.error("Error adding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    displayBtn && (
      <Button
        variant="outline"
        color="var(--teal, #0891B2)"
        border="none"
        onClick={() => addData()}
        disabled={isLoading}
      >
        {isLoading ? "読み込み中..." : "さらに表示（2か月分）"}
      </Button>
    )
  );
};

export default AddDataBtn;
