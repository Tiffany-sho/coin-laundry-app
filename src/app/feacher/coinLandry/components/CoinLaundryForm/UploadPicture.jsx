"use client";

import { Image, Button, FileUpload, Flex, Float } from "@chakra-ui/react";
import { LuFileImage, LuX } from "react-icons/lu";

const FileUploadList = ({ pictureFile, setPictureFile }) => {
  const deleteAction = (file) => {
    const filterArray = [...pictureFile].filter((item) => item.id !== file.id);
    URL.revokeObjectURL(file.url);
    setPictureFile(filterArray);
  };
  if (pictureFile.length === 0) return null;
  return (
    <FileUpload.ItemGroup>
      <Flex>
        {pictureFile.map((item) => (
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

const UploadPicture = ({ pictureFile, setPictureFile }) => {
  const changeHander = (e) => {
    const file = e.acceptedFiles[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const newFileItem = {
      id: crypto.randomUUID(),
      url: fileUrl,
      file: file,
    };
    const files = [...pictureFile, newFileItem];
    setPictureFile(files);
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
        <FileUploadList
          pictureFile={pictureFile}
          setPictureFile={setPictureFile}
        />
      </Flex>
    </FileUpload.Root>
  );
};

export default UploadPicture;
