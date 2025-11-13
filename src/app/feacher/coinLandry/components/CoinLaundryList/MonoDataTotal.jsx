import { createClient } from "@/utils/supabase/client";
import { Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const MonoDataTotal = ({ id }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("collect_funds")
        .select("*")
        .eq("laundryId", id);

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <VStack>
        <Spinner size="sm" color="green.500" />
        <Text fontSize="xs" color="gray.500">
          読み込み中...
        </Text>
      </VStack>
    );

  if (error)
    return (
      <Text fontSize="sm" color="red.500" fontWeight="medium">
        データを入手できませんでした
      </Text>
    );

  if (!data || data.length === 0) {
    return (
      <VStack align="stretch" gap={1}>
        <Text fontSize="2xl" fontWeight="bold" color="green.700">
          ¥0
        </Text>
        <Text fontSize="xs" color="gray.500">
          集金データがありません
        </Text>
      </VStack>
    );
  }

  const totalRevenue = data.reduce((accumulator, current) => {
    const summary = current.fundsArray.reduce((accumulator, currentValue) => {
      return accumulator + parseInt(currentValue.funds);
    }, 0);
    return accumulator + summary;
  }, 0);

  return (
    <VStack align="stretch" gap={1}>
      <Text fontSize="2xl" fontWeight="bold" color="green.700">
        ¥{totalRevenue.toLocaleString()}
      </Text>
      <Text fontSize="xs" color="gray.500">
        累計 {data.length}回の集金
      </Text>
    </VStack>
  );
};

export default MonoDataTotal;
