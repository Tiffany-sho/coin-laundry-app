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
        borderRadius="xl"
        border="1px solid"
        borderColor="red.200"
        textAlign="center"
      >
        <Text color="red.600" fontWeight="semibold">
          データ取得失敗
        </Text>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        bg="var(--teal-pale, #CFFAFE)"
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="cyan.200"
        textAlign="center"
      >
        <Text fontSize="sm" color="var(--teal-deeper, #155E75)" fontWeight="semibold">
          在庫状況
        </Text>
        <Text color="var(--text-muted, #64748B)" fontWeight="semibold" mt={1}>
          店舗がありません
        </Text>
      </Box>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <Box
        bg="var(--teal-pale, #CFFAFE)"
        px={4}
        py={8}
        border="1px solid"
        borderRadius="xl"
        borderColor="cyan.200"
      >
        <VStack align="center" gap={2} textAlign="center">
          <Box bg="var(--teal, #0891B2)" color="white" borderRadius="full" p={1.5}>
            <Icon.LuCheck size={16} />
          </Box>
          <Text fontSize="sm" color="var(--teal-deeper, #155E75)" fontWeight="semibold">
            在庫状況
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="var(--teal-deeper, #155E75)">
            在庫十分
          </Text>
          <Text fontSize="sm" color="var(--teal-dark, #0E7490)">
            すべての店舗で在庫は十分です
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg="orange.50"
      px={4}
      py={6}
      border="1px solid"
      borderRadius="xl"
      borderColor="orange.200"
    >
      <VStack align="center" gap={3} textAlign="center">
        <Box bg="orange.400" color="white" borderRadius="full" p={1.5}>
          <Icon.CiCircleAlert size={16} />
        </Box>
        <Text fontSize="sm" color="var(--text-muted, #64748B)" fontWeight="semibold">
          在庫状況
        </Text>
        <HStack gap={2} justify="center">
          <Badge
            bg="orange.400"
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
        <Text fontSize="xs" color="orange.500">
          補充が必要な店舗があります
        </Text>

        <VStack align="stretch" gap={2} w="full" pt={1}>
          {lowStockItems.map((item) => (
            <StockDialog initialData={item} key={item.laundryId} />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default NowStockState;
