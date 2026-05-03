import { getStockStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import StockDialog from "./parts/StockDialog";

const NowStockState = async () => {
  const { data, lowStockItems, error } = await getStockStates();

  if (error) {
    return (
      <Box
        bg="red.50"
        p={4}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="red.500"
        textAlign="center"
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
        textAlign="center"
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
        <VStack align="center" gap={2} textAlign="center">
          <Box bg="green.500" color="white" borderRadius="full" p={1.5}>
            <Icon.LuCheck size={16} />
          </Box>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            在庫状況
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="green.700">
            在庫十分
          </Text>
          <Text fontSize="sm" color="green.600">
            すべての店舗で在庫は十分です
          </Text>
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
        <VStack align="center" gap={2} textAlign="center">
          <Box bg="orange.500" color="white" borderRadius="full" p={1.5}>
            <Icon.CiCircleAlert size={16} />
          </Box>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            在庫状況
          </Text>
          <HStack gap={2} justify="center">
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
        </VStack>
      </Box>

      <VStack align="stretch" gap={2} w="full">
        {lowStockItems.map((item) => (
          <StockDialog initialData={item} key={item.laundryId} />
        ))}
      </VStack>
    </VStack>
  );
};

export default NowStockState;
