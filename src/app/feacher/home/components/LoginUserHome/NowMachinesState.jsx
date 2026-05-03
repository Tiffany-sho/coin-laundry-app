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
          設備状況
        </Text>
        <Text color="red.700" fontWeight="semibold">
          店舗がありません
        </Text>
      </Box>
    );
  }

  if (!breakMachines || breakMachines.length === 0) {
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
            設備状況
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="green.700">
            フル稼働中
          </Text>
          <Text fontSize="sm" color="green.600">
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
      border="2px solid"
      borderRadius="lg"
      borderLeft="4px solid"
      borderColor="red.500"
    >
      <VStack align="center" gap={3} textAlign="center">
        <Box bg="red.500" color="white" borderRadius="full" p={1.5}>
          <Icon.CiCircleAlert size={16} />
        </Box>
        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
          設備状況
        </Text>
        <HStack gap={2} justify="center">
          <Badge
            bg="red.500"
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
        <Text fontSize="xs" color="red.600">
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
