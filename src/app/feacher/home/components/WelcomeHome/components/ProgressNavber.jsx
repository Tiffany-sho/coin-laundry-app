import { Box, Text, VStack, Flex } from "@chakra-ui/react";
import { useUploadProfiles } from "../context/UploadProfilesContext";

const ProgressNavbar = () => {
  const { progress } = useUploadProfiles();
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="full"
      p={{ base: 4, md: 6 }}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      zIndex="5000"
    >
      <VStack align="stretch" gap={3}>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            初期設定
          </Text>
          <Text fontSize="xs" fontWeight="medium" color="blue.600">
            {progress}%
          </Text>
        </Flex>

        <Box
          w="full"
          h="8px"
          bg="gray.100"
          borderRadius="full"
          overflow="hidden"
          position="relative"
        >
          <Box
            h="full"
            w={`${progress}%`}
            bg="linear-gradient(90deg, #3182ce 0%, #63b3ed 100%)"
            borderRadius="full"
            transition="width 0.5s ease-in-out"
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "20px",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3))",
              animation: progress < 100 ? "shimmer 2s infinite" : "none",
            }}
            sx={{
              "@keyframes shimmer": {
                "0%": { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(100%)" },
              },
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
};

export default ProgressNavbar;
