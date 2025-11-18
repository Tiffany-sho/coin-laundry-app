import { Button } from "@chakra-ui/react";
import { useUploadPage } from "../../context/UploadPageContext";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const AddDataBtn = ({ id = "" }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [displayBtn, setDisplayBtn] = useState(true);
  const [dataCount, setDataCount] = useState(null);
  const { PAGE_SIZE, page, setPage, orderAmount, upOrder, setDisplayData } =
    useUploadPage();

  useEffect(() => {
    const getCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDataCount(null);
      }

      const { count, error } = await supabase
        .from("collect_funds")
        .select("*", { count: "exact", head: true })
        .eq("collecter", user.id);

      if (error) {
        console.error(error);
        setDataCount(null);
      } else {
        setDataCount(count);
      }
    };
    getCount();
  }, []);

  useEffect(() => {
    if (!dataCount) return;
    if (dataCount < page * PAGE_SIZE - 1) {
      setDisplayBtn(false);
    } else {
      setDisplayBtn(true);
    }
  }, [dataCount, page, dataCount]);

  const addData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
