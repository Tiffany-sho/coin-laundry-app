import { Flex, Image, Float, Button, Box } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

const DeletePicture = ({ pictureUrl, setPictureUrl }) => {
  const deleteAction = (url) => {
    const filterArray = [...pictureUrl].filter((item) => item.url !== url);
    setPictureUrl(filterArray);
  };
  return (
    <Flex>
      {pictureUrl.map((item) => (
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
