import { Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuPlus } from "@/app/feacher/Icon";

const AddBtn = () => {
  return (
    <Link href={"/coinLaundry/new"}>
      <Button
        position="fixed"
        bottom={{ base: "20px", md: "40px" }}
        right={{ base: "20px", md: "40px" }}
        zIndex="1000"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={1}
        bg="blue.500"
        color="white"
        w={{ base: "60px", md: "70px" }}
        h={{ base: "60px", md: "70px" }}
        borderRadius="full"
        border="2px solid"
        borderColor="blue.600"
        boxShadow="0 4px 15px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          bg: "blue.600",
          transform: "scale(1.1) translateY(-2px)",
          boxShadow:
            "0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        _active={{
          transform: "scale(0.95)",
          bg: "blue.700",
        }}
      >
        <Box>
          <LuPlus
            style={{ height: "28px", width: "28px", strokeWidth: "2.5" }}
          />
        </Box>
        <Text
          fontSize={{ base: "2xs", md: "xs" }}
          fontWeight="bold"
          letterSpacing="wide"
        >
          追加
        </Text>
      </Button>
    </Link>
  );
};

export default AddBtn;
