import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import * as Icon from "@/app/feacher/Icon";
import { Box, Flex, Image, IconButton, Text } from "@chakra-ui/react";

const DeletePicture = () => {
  const { state, dispatch } = useCoinLaundryForm();

  const deleteAction = (url) => {
    dispatch({ type: "REMOVE_EXISTING_PICTURE", payload: { url } });
  };

  if (state.existingPictures.length === 0) return null;

  return (
    <Box w="full">
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
        既存の写真
      </Text>
      <Flex flexWrap="wrap" gap={3}>
        {state.existingPictures.map((item) => (
          <Box
            key={item.url}
            position="relative"
            w={{ base: "70px", md: "80px" }}
            h={{ base: "70px", md: "80px" }}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg="gray.50"
            transition="all 0.2s"
          >
            <Image
              src={item.url}
              alt="既存の写真"
              w="full"
              h="full"
              objectFit="cover"
            />
            <IconButton
              position="absolute"
              top={1}
              right={1}
              size="2xs"
              borderRadius="full"
              bg="blackAlpha.700"
              color="white"
              transition="all 0.2s"
              backdropFilter="blur(4px)"
              _hover={{
                bg: "blackAlpha.800",
                transform: "scale(1.1)",
              }}
              onClick={() => deleteAction(item.url)}
            >
              <Icon.LuX size={14} />
            </IconButton>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default DeletePicture;
