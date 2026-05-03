import { getMachinesStates } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import MachinesDialog from "./parts/MachinesDialog";

const NowMachinesState = async () => {
  const { data, breakMachines, error } = await getMachinesStates();

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
          設備状況
        </Text>
        <Text color="var(--text-muted, #64748B)" fontWeight="semibold" mt={1}>
          店舗がありません
        </Text>
      </Box>
    );
  }

  if (!breakMachines || breakMachines.length === 0) {
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
            設備状況
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="var(--teal-deeper, #155E75)">
            フル稼働中
          </Text>
          <Text fontSize="sm" color="var(--teal-dark, #0E7490)">
            すべての設備が正常に稼働しています
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg="red.50"
      px={4}
      py={6}
      border="1px solid"
      borderRadius="xl"
      borderColor="red.200"
    >
      <VStack align="center" gap={3} textAlign="center">
        <Box bg="red.400" color="white" borderRadius="full" p={1.5}>
          <Icon.CiCircleAlert size={16} />
        </Box>
        <Text fontSize="sm" color="var(--text-muted, #64748B)" fontWeight="semibold">
          設備状況
        </Text>
        <HStack gap={2} justify="center">
          <Badge
            bg="red.400"
            color="white"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="bold"
          >
            故障発生中
          </Badge>
          <Text fontSize="lg" fontWeight="bold" color="red.700">
            {breakMachines.length}店舗
          </Text>
        </HStack>
        <Text fontSize="xs" color="red.500">
          至急対応が必要な店舗があります
        </Text>

        <VStack align="stretch" gap={2} w="full" pt={1}>
          {breakMachines.map((item) => (
            <MachinesDialog initialData={item} key={item.laundryId} />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default NowMachinesState;
