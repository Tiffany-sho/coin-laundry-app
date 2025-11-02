"use client";

import { Image, Button, FileUpload, Flex, Float } from "@chakra-ui/react";
import { LuFileImage, LuX } from "react-icons/lu";
import { useCoinLaundryForm } from "../../context/CoinlaundryForm/CoinLaundryFormContext";

const FileUploadList = () => {
  const { state, dispatch } = useCoinLaundryForm();
  const deleteAction = (removeFileItem) => {
    dispatch({ type: "REMOVE_PICTURE", payload: { removeFileItem } });
  };
  if (state.newPictures.length === 0) return null;
  // console.log(state);

  return (
    <FileUpload.ItemGroup>
      <Flex>
        {state.newPictures.map((item) => (
          <FileUpload.Item
            w="auto"
            boxSize="20"
            p="2"
            file={item.file}
            key={item.id}
          >
            <Image src={item.url} />
            <Float placement="top-end">
              <FileUpload.ItemDeleteTrigger
                boxSize="4"
                layerStyle="fill.solid"
                onClick={() => deleteAction(item)}
              >
                <LuX />
              </FileUpload.ItemDeleteTrigger>
            </Float>
          </FileUpload.Item>
        ))}
      </Flex>
    </FileUpload.ItemGroup>
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
    <FileUpload.Root accept="image/*" onFileChange={changeHander}>
      <Flex direction="row">
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <Button variant="outline" size="sm">
            <LuFileImage /> 画像をアップロード
          </Button>
        </FileUpload.Trigger>
        <FileUploadList />
      </Flex>
    </FileUpload.Root>
  );
};

export default UploadPicture;
