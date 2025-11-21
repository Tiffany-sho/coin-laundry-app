import { Button } from "@chakra-ui/react";
import { useUploadPage } from "../../context/UploadPageContext";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

const AddDataBtn = ({ id = "" }) => {
  const supabase = createClient();
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
    const { user } = await getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    setIsLoading(true);

    if (id) {
      const { data: nextData, error: nextError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("collecter", user.id)
        .eq("laundryId", id)
        .order(orderAmount, { ascending: upOrder })
        .range(from, to);

      if (nextError) {
        setDisplayData(null);
      } else {
        if (nextData.length < PAGE_SIZE) {
          setDisplayBtn(false);
        }
        setDisplayData((prev) => [...prev, ...nextData]);
      }
    } else {
      const { data: nextData, error: nextError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("collecter", user.id)
        .order(orderAmount, { ascending: upOrder })
        .range(from, to);

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
    setIsLoading(false);
  };

  return (
    displayBtn && (
      <Button
        variant="outline"
        color="blue.600"
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
