import { createClient } from "@/utils/supabase/server";
import { Badge, Box, HStack, Text, VStack, Icon } from "@chakra-ui/react";
import { LuCheck, LuPackage } from "react-icons/lu";
import { CiCircleAlert } from "react-icons/ci";
import { MdStore } from "react-icons/md";

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

  return { data: lowStockItems };
};

const NowStockState = async ({ id }) => {
  const { data: lowStockItems, error } = await getData(id);

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
              <LuCheck size={16} />
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
            <CiCircleAlert size={16} />
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

      {/* 各店舗の詳細 */}
      <VStack align="stretch" gap={2} w="full">
        {lowStockItems.map((item) => {
          const isDetergentLow = item.detergent < 2;
          const isSoftenerLow = item.softener < 2;
          const isCritical = item.detergent < 1 || item.softener < 1;

          return (
            <Box
              key={item.laundryId}
              bg="white"
              p={3}
              borderRadius="md"
              border="1px solid"
              borderColor={isCritical ? "red.200" : "orange.200"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: isCritical ? "red.50" : "orange.50",
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: isCritical ? "red.300" : "orange.300",
              }}
            >
              <VStack align="stretch" gap={2}>
                {/* 店舗名 */}
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <MdStore
                      color={isCritical ? "#E53E3E" : "#DD6B20"}
                      size={18}
                    />
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                      {item.laundryName}
                    </Text>
                  </HStack>
                  {isCritical && (
                    <Badge
                      bg="red.500"
                      color="white"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontWeight="bold"
                    >
                      緊急
                    </Badge>
                  )}
                </HStack>

                {/* 在庫バッジ */}
                <HStack gap={2} flexWrap="wrap">
                  <Badge
                    bg={
                      isDetergentLow
                        ? item.detergent < 1
                          ? "red.500"
                          : "orange.200"
                        : "green.200"
                    }
                    color={
                      isDetergentLow
                        ? item.detergent < 1
                          ? "white"
                          : "orange.800"
                        : "green.800"
                    }
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontWeight="semibold"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <LuPackage size={12} />
                    洗剤: {item.detergent}個
                  </Badge>
                  <Badge
                    bg={
                      isSoftenerLow
                        ? item.softener < 1
                          ? "red.500"
                          : "orange.200"
                        : "green.200"
                    }
                    color={
                      isSoftenerLow
                        ? item.softener < 1
                          ? "white"
                          : "orange.800"
                        : "green.800"
                    }
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontWeight="semibold"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <LuPackage size={12} />
                    柔軟剤: {item.softener}個
                  </Badge>
                </HStack>

                {/* 状態メッセージ */}
                <Text
                  fontSize="xs"
                  color={isCritical ? "red.700" : "orange.700"}
                  fontWeight="medium"
                  bg={isCritical ? "red.50" : "orange.50"}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {isCritical
                    ? "至急補充してください"
                    : " 補充をおすすめします"}
                </Text>
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default NowStockState;
