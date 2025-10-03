import { HStack, Skeleton, Stack } from "@chakra-ui/react";

const ListSkeleton = () => {
  return (
    <HStack gap="5" width="90%" ml="5%">
      <Skeleton height="40" width="40" />
      <Stack flex="1">
        <Skeleton height="7" width="40" />
        <Skeleton height="5" />
        <Skeleton height="5" width="80" mb="10%" />
        <Skeleton height="10" width="20%" />
      </Stack>
    </HStack>
  );
};

export default ListSkeleton;
