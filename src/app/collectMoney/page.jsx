import List from "@/components/List";
import { Box } from "@chakra-ui/react";

const CollectMoney = () => {
  return (
    <>
      <Box>
        <Box
          textStyle="3xl"
          textAlign="center"
          my="4"
          fontWeight="bold"
          overflow="hidden"
        >
          集金店舗一覧
        </Box>
        <List valiant="collect" />
      </Box>
    </>
  );
};

export default CollectMoney;
