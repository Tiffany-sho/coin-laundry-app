import { HStack, Skeleton, Stack } from "@chakra-ui/react";

const MonoSkeleton = () => {
  return (
    <HStack gap="5" width="90%" ml="5%">
      <Stack flex="1">
        <Skeleton height="20" width="100%" />
        <Skeleton height="7" width="40%" />
        <Skeleton height="5" />
        <Skeleton height="5" width="80%" mb="10%" />
        <Skeleton height="10" width="20" ml="auto" />
      </Stack>
    </HStack>
  );
};

export default MonoSkeleton;
