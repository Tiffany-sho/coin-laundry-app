import { Button } from "@chakra-ui/react";
import { useUploadPage } from "@/app/feacher/collectMoney/context/UploadPageContext";
import { useState } from "react";
import { getStoreFundsPaginated, getOrgCollectFundsPaginated } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";

const AddDataBtn = ({ id = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    PAGE_SIZE,
    page,
    setPage,
    orderAmount,
    upOrder,
    setDisplayData,
    displayBtn,
    setDisplayBtn,
  } = useUploadPage();

  const addData = async () => {
    setIsLoading(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      if (id) {
        // aStore: サーバーアクションで組織の集金データを追加取得（全期間）
        const { data: nextData, error: nextError } = await getStoreFundsPaginated(
          id,
          orderAmount,
          upOrder,
          from,
          to
        );

        if (nextError) {
          setDisplayData(null);
        } else {
          if (nextData.length < PAGE_SIZE) {
            setDisplayBtn(false);
          }
          setDisplayData((prev) => [...prev, ...nextData]);
        }
      } else {
        // manyStore: サーバーアクションで組織全体の集金データを追加取得
        const { data: nextData, error: nextError } = await getOrgCollectFundsPaginated(
          orderAmount,
          upOrder,
          from,
          to
        );

        if (nextError) {
          setDisplayData(null);
        } else {
          if (nextData.length < PAGE_SIZE) {
            setDisplayBtn(false);
          }
          setDisplayData((prev) => [...prev, ...nextData]);
        }
      }

      setPage((prev) => prev + 1);
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
        onClick={() => addData(id)}
        disabled={isLoading}
      >
        {isLoading ? "読み込み中..." : "さらに表示"}
      </Button>
    )
  );
};

export default AddDataBtn;
