"use client";

import {
  Box,
  Button,
  Card,
  Field,
  Input,
  InputGroup,
  Stack,
  Textarea,
  CloseButton,
  Drawer,
  Portal,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import Link from "next/link";

import MachineForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/MachineForm";
import { redirect } from "next/navigation";
import {
  getImage,
  uploadImage,
  deleteImage,
} from "@/app/api/supabaseFunctions/route";
import CheckDialog from "@/app/feacher/dialog/CheckDialog/CheckDialog";
import UploadPicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/UploadPicture";
import DeletePicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/DeletePicture";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import { createStore, updateStore } from "@/app/coinLaundry/action";

const CoinLaundryForm = ({ storeId, images = [], method }) => {
  const { state, dispatch } = useCoinLaundryForm();
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
  const dialogRef = useRef(null);

  const postHander = async () => {
    dispatch({ type: "SET_ISLOADING", payload: true });
    dispatch({ type: "SET_MSG", payload: "" });

    const formData = new FormData(formRef.current);
    const newMachine = state.machines
      .filter((machine) => machine.num > 0)
      .map((machine) => {
        const newObj = { ...machine };
        newObj.id = crypto.randomUUID();
        return newObj;
      });

    const filesToUpload = state.newPictures.filter((item) => item.file);

    if (filesToUpload.length > 0) {
      const invalidFiles = filesToUpload.some(
        (item) =>
          item.file.type !== "image/jpeg" && item.file.type !== "image/png"
      );
      if (invalidFiles) {
        dispatch({
          type: "SET_MSG",
          payload: "jpeg/pngファイルを選択してください",
        });

        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    let newImageObjects = [];

    if (filesToUpload.length > 0) {
      try {
        const uploadPromises = filesToUpload.map((item) => {
          const fileName = `${Date.now()}_${item.file.name}`;
          return (async () => {
            await uploadImage(fileName, item.file);
            const data = getImage(fileName);
            return { path: fileName, url: data.publicUrl };
          })();
        });

        newImageObjects = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Upload failed:", error);
        dispatch({
          type: "SET_MSG",
          payload: "画像のアップロード中にエラーが発生しました",
        });
        dispatch({ type: "SET_ISLOADING", payload: false });
        return;
      }
    }

    const finalImageUrlList = [...state.existingPictures, ...newImageObjects];

    formData.append("machines", JSON.stringify(newMachine));
    formData.append("images", JSON.stringify(finalImageUrlList));

    let responseData;

    try {
      if (
        state.store === "" ||
        state.location === "" ||
        state.description === ""
      ) {
        throw new Error("空のフォームデータがあります。");
      }
      if (method === "POST") {
        const { data, error } = await createStore(formData);
        if (error) {
          throw new Error(error.message || "ストアの作成に失敗しました");
        }
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await updateStore(formData, storeId);

        if (error) {
          throw new Error(error.message || "ストアの編集に失敗しました");
        }
        responseData = data;
      }
    } catch (error) {
      console.error("API Error:", error);
      dispatch({
        type: "SET_MSG",
        payload: error.message || "データの送信に失敗しました。",
      });
      dispatch({ type: "SET_ISLOADING", payload: false });
      if (dialogRef.current) {
        dialogRef.current.click();
      }

      if (newImageObjects.length > 0) {
        console.warn("Rollback: Deleting newly uploaded images...");
        const deletePromises = newImageObjects.map((img) =>
          deleteImage(img.path)
        );
        Promise.all(deletePromises).catch((err) =>
          console.error("Rollback delete failed:", err)
        );
      }
      return;
    }
    const finalImagePaths = new Set(finalImageUrlList.map((img) => img.path));
    const pathsToDelete = images
      .map((img) => img.path)
      .filter((path) => !finalImagePaths.has(path));

    if (pathsToDelete.length > 0) {
      Promise.all(pathsToDelete.map((path) => deleteImage(path)))
        .then(() => console.log("Old images cleaned up."))
        .catch((err) => console.error("Cleanup deletion failed:", err));
    }

    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.store}店の${
          method === "POST" ? "登録" : "編集"
        }が完了しました。`,
        type: "success",
        closable: true,
      })
    );
    setTimeout(() => {
      dispatch({ type: "SET_ISLOADING", payload: false });
    }, 10000);
    redirect(`/coinLaundry/${responseData.id}`);
  };

  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      p={{ base: 3, md: 5 }}
      bg="gray.50"
    >
      <Box w="full" maxW="500px">
        <form ref={formRef}>
          <Card.Root
            borderRadius="2xl"
            boxShadow="xl"
            bg="white"
            overflow="hidden"
          >
            <Card.Header bg="gray.700" color="white" p={{ base: 4, md: 6 }}>
              <Card.Title
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                mb={state.msg ? 2 : 0}
              >
                {method === "POST" && "登録"}
                {method === "PUT" && "編集"}フォーム
              </Card.Title>
            </Card.Header>

            <Card.Body p={{ base: 4, md: 8 }}>
              {state.msg && (
                <Text color="red.300" fontSize="md" fontWeight="medium" mt={2}>
                  {state.msg}
                </Text>
              )}
              <Stack gap={6} w="full">
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    店舗名
                  </Field.Label>
                  <InputGroup
                    endAddon="店"
                    endAddonProps={{
                      bg: "gray.100",
                      color: "gray.600",
                      px: 4,
                      fontWeight: "semibold",
                      fontSize: "sm",
                      borderLeft: "1px solid",
                      borderColor: "gray.200",
                    }}
                  >
                    <Input
                      type="text"
                      name="store"
                      id="store"
                      value={state.store}
                      placeholder="例)四条河原町"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      py={2.5}
                      px={3}
                      fontSize="16px"
                      transition="all 0.2s"
                      _focus={{
                        borderColor: "gray.700",
                        boxShadow: "0 0 0 3px rgba(45, 55, 72, 0.1)",
                        outline: "none",
                      }}
                      _placeholder={{
                        color: "gray.400",
                      }}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_DATA",
                          payload: { field: "store", value: e.target.value },
                        })
                      }
                    />
                  </InputGroup>
                </Field.Root>

                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    場所
                  </Field.Label>
                  <Input
                    type="text"
                    name="location"
                    id="location"
                    value={state.location}
                    placeholder="例)京都府京都市下京区"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    py={2.5}
                    px={3}
                    fontSize="16px"
                    transition="all 0.2s"
                    _focus={{
                      borderColor: "gray.700",
                      boxShadow: "0 0 0 3px rgba(45, 55, 72, 0.1)",
                      outline: "none",
                    }}
                    _placeholder={{
                      color: "gray.400",
                    }}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FORM_DATA",
                        payload: { field: "location", value: e.target.value },
                      })
                    }
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    概要
                  </Field.Label>
                  <Textarea
                    name="description"
                    id="description"
                    resize="none"
                    h="20"
                    value={state.description}
                    placeholder="例)デパートやブティックだけでなく、着物や書道具を商う古くからの店が並ぶ繁華街です。"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    py={2.5}
                    px={3}
                    fontSize="16px"
                    transition="all 0.2s"
                    _focus={{
                      borderColor: "gray.700",
                      boxShadow: "0 0 0 3px rgba(45, 55, 72, 0.1)",
                      outline: "none",
                    }}
                    _placeholder={{
                      color: "gray.400",
                    }}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FORM_DATA",
                        payload: {
                          field: "description",
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </Field.Root>

                <Drawer.Root
                  size={{ base: "xs", md: "md" }}
                  open={open}
                  onOpenChange={(e) => setOpen(e.open)}
                >
                  <Drawer.Trigger asChild>
                    <Button
                      w="full"
                      bg="gray.100"
                      color="gray.700"
                      fontWeight="semibold"
                      py={3}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      transition="all 0.2s"
                      _hover={{
                        bg: "gray.200",
                      }}
                      onClick={() => setOpen((prev) => !prev)}
                    >
                      {open ? "選択中..." : "機械選択"}
                    </Button>
                  </Drawer.Trigger>
                  <Portal>
                    <Drawer.Backdrop bg="blackAlpha.600" />
                    <Drawer.Positioner>
                      <Drawer.Content borderRadius="xl">
                        {open && (
                          <>
                            <Drawer.Body p={{ base: 4, md: 6 }}>
                              <MachineForm setOpen={setOpen} />
                            </Drawer.Body>
                            <Drawer.CloseTrigger asChild>
                              <CloseButton
                                position="absolute"
                                top={4}
                                right={4}
                                bg="white"
                                borderRadius="full"
                                boxShadow="sm"
                                _hover={{
                                  bg: "gray.100",
                                  transform: "scale(1.1)",
                                }}
                                transition="all 0.2s"
                              />
                            </Drawer.CloseTrigger>
                          </>
                        )}
                      </Drawer.Content>
                    </Drawer.Positioner>
                  </Portal>
                </Drawer.Root>

                <UploadPicture />
                <DeletePicture />
              </Stack>
            </Card.Body>

            <Card.Footer
              p={{ base: 4, md: 5 }}
              bg="gray.50"
              borderTop="1px solid"
              borderColor="gray.200"
              gap={3}
              flexDirection={{ base: "column", md: "row" }}
              justifyContent="flex-end"
            >
              <Link href={`/coinLaundry/${storeId ? storeId : ""}`}>
                <Button
                  variant="outline"
                  w={{ base: "full", md: "auto" }}
                  minW={{ md: "100px" }}
                  fontWeight="semibold"
                  py={2.5}
                  px={5}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor="gray.200"
                  bg="white"
                  color="gray.700"
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.50",
                  }}
                >
                  キャンセル
                </Button>
              </Link>
              <CheckDialog
                method={method}
                postHander={postHander}
                dialogRef={dialogRef}
              />
            </Card.Footer>
          </Card.Root>
        </form>
      </Box>
    </Flex>
  );
};

export default CoinLaundryForm;
