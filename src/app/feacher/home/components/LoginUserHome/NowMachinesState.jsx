import { createClient } from "@/utils/supabase/server";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const getData = async (id) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laundry_state")
    .select("machines,laundryId,laundryName")
    .eq("stocker", id);

  if (error) {
    return { error: error.message };
  }

  console.log(data);

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

  // 故障がある場合
  return (
    <VStack align="stretch" gap={3} w="full">
      {/* サマリーカード */}
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

      {/* 各店舗の詳細 */}
      <VStack align="stretch" gap={2} w="full">
        {breakMachines.map((item) => {
          const brokenMachines = item.machines.filter((m) => m.break);

          return (
            <Box
              key={item.laundryId}
              bg="white"
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor="red.200"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: "red.50",
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: "red.300",
              }}
            >
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <Icon.LiaStoreSolid color="#E53E3E" size={18} />
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                      {item.laundryName}
                    </Text>
                  </HStack>
                  <Badge
                    bg="red.100"
                    color="red.700"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {brokenMachines.length}台故障
                  </Badge>
                </HStack>

                <VStack align="stretch" gap={1} pl={2}>
                  {brokenMachines.slice(0, 3).map((machine, index) => (
                    <HStack key={index} gap={2}>
                      <Box w="4px" h="4px" bg="red.500" borderRadius="full" />
                      <Text fontSize="xs" color="red.700" fontWeight="medium">
                        {machine.name}
                      </Text>
                    </HStack>
                  ))}
                  {brokenMachines.length > 3 && (
                    <Text fontSize="xs" color="red.600" pl={4}>
                      他 {brokenMachines.length - 3}台
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default NowMachinesState;
