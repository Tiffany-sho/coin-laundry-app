import { Flex, Image, Float, Button, Box } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { useCoinLaundryForm } from "../../context/CoinlaundryForm/CoinLaundryFormContext";

const DeletePicture = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const deleteAction = (url) => {
    dispatch({ type: "REMOVE_EXISTING_PICTURE", payload: { url } });
  };
  return (
    <Flex>
      {state.existingPictures.map((item) => (
        <Box key={item.url} position="relative">
          <Image src={item.url} w="auto" boxSize="20" p="2" />
          <Float placement="top-end">
            <Button size="3xs" onClick={() => deleteAction(item.url)}>
              <LuX />
            </Button>
          </Float>
        </Box>
      ))}
    </Flex>
  );
};

export default DeletePicture;
