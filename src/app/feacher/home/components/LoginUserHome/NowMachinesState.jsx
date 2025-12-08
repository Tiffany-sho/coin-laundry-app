import { createClient } from "@/utils/supabase/server";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import MachinesDialog from "./parts/MachinesDialog";

const getData = async (id) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("machines,laundryId,laundryName")
    .eq("stocker", id);

  if (error) {
    return { error: "設備状況の取得に失敗しました" };
  }

  const breakMachines = data.filter(
    (item) => item.machines.filter((machine) => machine.break).length !== 0
  );

  return { data: data, breakMachines: breakMachines };
};

const NowMachinesState = async ({ id }) => {
  const { data, breakMachines, error } = await getData(id);

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
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600" fontWeight="semibold">
              設備状況
            </Text>
            <Box bg="green.500" color="white" borderRadius="full" p={1.5}>
              <Icon.LuCheck size={16} />
            </Box>
          </HStack>

          <VStack align="stretch" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="green.700">
              フル稼働中
            </Text>
            <Text fontSize="sm" color="green.600">
              すべての設備が正常に稼働しています
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={3} w="full">
      <Box
        bg="red.50"
        p={4}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="red.500"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            設備状況
          </Text>
          <Box bg="red.500" color="white" borderRadius="full" p={1.5}>
            <Icon.CiCircleAlert size={16} />
          </Box>
        </HStack>

        <HStack gap={2} mb={1}>
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
      </Box>

      <VStack align="stretch" gap={2} w="full">
        {breakMachines.map((item) => {
          return <MachinesDialog id={item.laundryId} key={item.laundryId} />;
        })}
      </VStack>
    </VStack>
  );
};

export default NowMachinesState;
