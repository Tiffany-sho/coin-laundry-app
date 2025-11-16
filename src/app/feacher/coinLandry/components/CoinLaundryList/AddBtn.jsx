import { Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import { LuPlus } from "@/app/feacher/Icon";

const AddBtn = () => {
  return (
    <Link href={"/coinLaundry/new"}>
      <Button
        position="fixed"
        top="85%"
        right="0"
        zIndex="sticky"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgColor="gray.700"
        color="white"
        w="50px"
        h="50px"
        borderRadius="full"
        _hover={{ bgColor: "gray.600" }}
      >
        <Box>
          <LuPlus style={{ height: "35px", width: "35px" }} />
        </Box>
      </Button>
    </Link>
  );
};

export default AddBtn;
