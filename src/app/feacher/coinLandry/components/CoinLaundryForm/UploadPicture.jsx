"use client";

import {
  FileUpload,
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  VStack,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const FileUploadList = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const deleteAction = (removeFileItem) => {
    dispatch({ type: "REMOVE_PICTURE", payload: { removeFileItem } });
  };

  if (state.newPictures.length === 0) return null;

  return (
    <Flex flexWrap="wrap" gap={{ base: 2, md: 3 }} mt={2}>
      {state.newPictures.map((item) => (
        <Box
          key={item.id}
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
            alt="アップロード画像"
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
            onClick={() => deleteAction(item)}
          >
            <Icon.LuX size={14} />
          </IconButton>
        </Box>
      ))}
    </Flex>
  );
};

const UploadPicture = () => {
  const { dispatch } = useCoinLaundryForm();

  const changeHander = (e) => {
    const file = e.acceptedFiles[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const newFileItem = {
      id: crypto.randomUUID(),
      url: fileUrl,
      file: file,
    };

    dispatch({ type: "ADD_NEW_PICTURE", payload: { newFileItem } });
  };

  return (
    <Box w="full">
      <FileUpload.Root accept="image/*" onFileChange={changeHander}>
        <VStack align="stretch" gap={4}>
          <FileUpload.HiddenInput />
          <FileUpload.Trigger asChild>
            <Button
              type="button"
              w={{ base: "full", md: "auto" }}
              display="inline-flex"
              alignItems="center"
              gap={2}
              py={2.5}
              px={5}
              bg="white"
              color="gray.700"
              fontWeight="semibold"
              border="2px solid"
              borderColor="gray.200"
              borderRadius="lg"
              transition="all 0.2s"
              justifyContent={{ base: "center", md: "flex-start" }}
              _hover={{
                bg: "gray.50",
                borderColor: "gray.300",
              }}
            >
              <Icon.LuFileImage size={18} />
              画像をアップロード
            </Button>
          </FileUpload.Trigger>
          <FileUploadList />
        </VStack>
      </FileUpload.Root>
    </Box>
  );
};

export default UploadPicture;
