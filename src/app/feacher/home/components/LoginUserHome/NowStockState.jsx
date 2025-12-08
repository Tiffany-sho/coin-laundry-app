import { createClient } from "@/utils/supabase/server";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import StockDialog from "./parts/StockDialog";

const getData = async (id) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("detergent,softener,laundryId,laundryName")
    .eq("stocker", id);

  if (error) {
    return { error: error.message };
  }

  const lowStockItems = data.filter(
    (item) => item.detergent < 2 || item.softener < 2
  );

  return { data: data, lowStockItems: lowStockItems };
};

const NowStockState = async ({ id }) => {
  const { data, lowStockItems, error } = await getData(id);

  if (error) {
    return (
      <Box
        bg="red.50"
        p={4}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="red.500"
      >
        <Text color="red.700" fontWeight="semibold">
          データ取得失敗
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        bg="green.50"
        p={4}
        borderRadius="lg"
        border="2px solid"
        borderLeft="4px solid"
        borderColor="green.500"
      >
        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
          在庫状況
        </Text>
        <Text color="red.700" fontWeight="semibold">
          店舗がありません
        </Text>
      </Box>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <Box
        bg="green.50"
        px={4}
        py={8}
        border="2px solid"
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="green.500"
      >
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600" fontWeight="semibold">
              在庫状況
            </Text>
            <Box bg="green.500" color="white" borderRadius="full" p={1.5}>
              <Icon.LuCheck size={16} />
            </Box>
          </HStack>

          <VStack align="stretch" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="green.700">
              在庫十分
            </Text>
            <Text fontSize="sm" color="green.600">
              すべての店舗で在庫は十分です
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={3} w="full">
      <Box
        bg="orange.50"
        px={4}
        py={8}
        border="2px solid"
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="orange.500"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            在庫状況
          </Text>
          <Box bg="orange.500" color="white" borderRadius="full" p={1.5}>
            <Icon.CiCircleAlert size={16} />
          </Box>
        </HStack>

        <HStack gap={2} mb={1}>
          <Badge
            bg="orange.500"
            color="white"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="bold"
          >
            在庫不足
          </Badge>
          <Text fontSize="lg" fontWeight="bold" color="orange.700">
            {lowStockItems.length}店舗
          </Text>
        </HStack>

        <Text fontSize="xs" color="orange.600">
          補充が必要な店舗があります
        </Text>
      </Box>

      <VStack align="stretch" gap={2} w="full">
        {lowStockItems.map((item) => {
          return <StockDialog id={item.laundryId} key={item.laundryId} />;
        })}
      </VStack>
    </VStack>
  );
};

export default NowStockState;
