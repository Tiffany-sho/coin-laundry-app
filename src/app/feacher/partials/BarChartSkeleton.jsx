import { Box, Flex, Skeleton } from "@chakra-ui/react";

const BAR_HEIGHTS = [55, 75, 45, 85, 60, 40, 70, 50, 65, 80, 55, 90];

const BarChartSkeleton = () => {
  return (
    <Box w="100%" h="260px" py={4} px={2}>
      <Flex h="100%" gap={2} align="flex-end" justify="space-between" pb={8}>
        {BAR_HEIGHTS.map((h, i) => (
          <Skeleton
            key={i}
            flex={1}
            height={`${h}%`}
            borderRadius="sm"
            startColor="cyan.50"
            endColor="cyan.100"
            style={{
              animationDelay: `${i * 0.06}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default BarChartSkeleton;
