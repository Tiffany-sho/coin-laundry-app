import React from "react";
import { Box, VStack, Text, Spinner } from "@chakra-ui/react";

const LoadingScreen = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <VStack spacing={6}>
        {/* 洗濯機アイコン */}
        <Box
          width="120px"
          height="120px"
          bg="blue.500"
          borderRadius="20px"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="lg"
        >
          {/* 洗濯機の窓 */}
          <Box
            width="85px"
            height="85px"
            borderRadius="50%"
            border="4px solid white"
            bg="blue.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
          >
            {/* 回転するSpinner */}
            <Spinner
              thickness="4px"
              speed="0.8s"
              emptyColor="blue.100"
              color="blue.500"
              size="lg"
            />
          </Box>

          {/* 洗濯機のボタン */}
          <Box
            position="absolute"
            top="10px"
            left="15px"
            display="flex"
            gap={2}
          >
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              bg="white"
              opacity="0.8"
            />
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              bg="white"
              opacity="0.8"
            />
          </Box>
        </Box>

        {/* ローディングテキスト */}
        <Text color="gray.700" fontSize="lg" fontWeight="medium">
          Loading...
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingScreen;
