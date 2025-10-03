import List from "./components/List";
import AddBtn from "@/app/coinLaundry/components/AddBtn";
import { Box } from "@chakra-ui/react";

const CoinLaundries = () => {
  return (
    <Box>
      <Box
        textStyle="3xl"
        textAlign="center"
        my="4"
        fontWeight="bold"
        overflow="hidden"
      >
        店舗一覧
      </Box>
      <List />
      <AddBtn />
    </Box>
  );
};

export default CoinLaundries;
