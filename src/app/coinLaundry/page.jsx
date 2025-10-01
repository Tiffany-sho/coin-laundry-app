import List from "../../components/List";
import AddBtn from "@/partials/AddBtn";
import { Box } from "@chakra-ui/react";

const CoinLaundries = () => {
  return (
    <>
      <Box textStyle="3xl" textAlign="center" my="4" fontWeight="bold">
        店舗一覧
      </Box>
      <List />
      <AddBtn />
    </>
  );
};

export default CoinLaundries;
