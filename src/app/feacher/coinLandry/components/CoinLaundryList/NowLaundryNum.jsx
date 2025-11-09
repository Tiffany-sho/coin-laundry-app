import { VStack, Text, HStack, Badge } from "@chakra-ui/react";

const NowLaundryNum = () => {
  const stock = {
    detergent: 3,
    softener: 1,
  };
  return (
    <VStack align="stretch" gap={1}>
      <Text fontSize="xs" color="gray.600" fontWeight="medium">
        在庫状況
      </Text>
      <HStack gap={1} flexWrap="wrap">
        <Badge bg={stock.detergent > 1 ? "green.200" : "red.300"} fontSize="xs">
          洗剤 {stock.detergent}
        </Badge>
        <Badge bg={stock.softener > 1 ? "green.200" : "red.300"} fontSize="xs">
          柔軟剤 {stock.softener}
        </Badge>
      </HStack>
      <Text
        fontSize="xs"
        color={
          stock.detergent < 2 || stock.softener < 2 ? "red.600" : " gray.600"
        }
        mt={1}
      >
        {stock.detergent < 2 || stock.softener < 2 ? "在庫不足" : " 在庫良好"}
      </Text>
    </VStack>
  );
};

export default NowLaundryNum;
