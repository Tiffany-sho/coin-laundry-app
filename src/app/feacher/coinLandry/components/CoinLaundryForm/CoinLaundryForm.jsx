"use client";

import {
  Box,
  Button,
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
  Heading,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import Link from "next/link";

import MachineForm from "@/app/feacher/coinLandry/components/CoinLaundryForm/MachineForm";
import CheckDialog from "@/app/feacher/dialog/CheckDialog";
import UploadPicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/UploadPicture";
import DeletePicture from "@/app/feacher/coinLandry/components/CoinLaundryForm/DeletePicture";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";
import { useStoreSubmit } from "./useStoreSubmit";

const FOCUS_STYLE = {
  borderColor: "cyan.500",
  boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
  outline: "none",
};

const CoinLaundryForm = ({ storeId, images = [], method }) => {
  const { state, dispatch } = useCoinLaundryForm();
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
  const dialogRef = useRef(null);

  const { postHander } = useStoreSubmit({ storeId, images, method, formRef, dialogRef });

  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      p={{ base: 4, md: 6 }}
      bg="var(--app-bg, #F0F9FF)"
    >
      <Box w="full" maxW="600px">
        <form ref={formRef}>
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="var(--shadow-sm)"
            border="1px solid rgba(8, 145, 178, 0.10)"
            p={{ base: 6, md: 8 }}
          >
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl" }}
              mb={6}
              color="var(--text-main, #1E3A5F)"
            >
              {method === "POST" && "登録"}
              {method === "PUT" && "編集"}フォーム
            </Heading>

            {state.msg && (
              <Box
                mb={4}
                p={3}
                bg="red.50"
                borderLeft="4px solid"
                borderColor="red.400"
                borderRadius="md"
              >
                <Text color="red.700" fontSize="sm" fontWeight="medium">
                  {state.msg}
                </Text>
              </Box>
            )}

            <Stack gap={6} w="full">
              <Field.Root>
                <Field.Label
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-main, #1E3A5F)"
                  mb={2}
                >
                  店舗名
                </Field.Label>
                <InputGroup
                  endAddon="店"
                  endAddonProps={{
                    bg: "var(--teal-pale, #CFFAFE)",
                    color: "var(--teal-deeper, #155E75)",
                    px: 4,
                    fontWeight: "semibold",
                    fontSize: "sm",
                    borderLeft: "1px solid",
                    borderColor: "rgba(8,145,178,0.20)",
                  }}
                >
                  <Input
                    type="text"
                    name="store"
                    id="store"
                    value={state.store}
                    placeholder="例)四条河原町"
                    border="1.5px solid"
                    borderColor="var(--divider, #F1F5F9)"
                    borderRadius="lg"
                    py={2}
                    px={3}
                    fontSize="16px"
                    transition="all 0.2s"
                    _focus={FOCUS_STYLE}
                    _placeholder={{ color: "var(--text-faint, #94A3B8)" }}
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
                  color="var(--text-main, #1E3A5F)"
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
                  border="1.5px solid"
                  borderColor="var(--divider, #F1F5F9)"
                  borderRadius="lg"
                  py={2}
                  px={3}
                  fontSize="16px"
                  transition="all 0.2s"
                  _focus={FOCUS_STYLE}
                  _placeholder={{ color: "var(--text-faint, #94A3B8)" }}
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
                  color="var(--text-main, #1E3A5F)"
                  mb={2}
                >
                  概要
                </Field.Label>
                <Textarea
                  name="description"
                  id="description"
                  resize="none"
                  h="24"
                  value={state.description}
                  placeholder="例)デパートやブティックだけでなく、着物や書道具を商う古くからの店が並ぶ繁華街です。"
                  border="1.5px solid"
                  borderColor="var(--divider, #F1F5F9)"
                  borderRadius="lg"
                  py={2}
                  px={3}
                  fontSize="16px"
                  transition="all 0.2s"
                  _focus={FOCUS_STYLE}
                  _placeholder={{ color: "var(--text-faint, #94A3B8)" }}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FORM_DATA",
                      payload: { field: "description", value: e.target.value },
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
                    bg="var(--teal-pale, #CFFAFE)"
                    color="var(--teal-deeper, #155E75)"
                    fontWeight="semibold"
                    py={2.5}
                    borderRadius="lg"
                    border="1.5px solid"
                    borderColor="rgba(8,145,178,0.25)"
                    transition="all 0.2s"
                    _hover={{
                      bg: "cyan.100",
                      borderColor: "var(--teal, #0891B2)",
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
                              _hover={{ bg: "cyan.50", transform: "scale(1.1)" }}
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

            <Flex
              mt={8}
              pt={6}
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              gap={3}
              flexDirection={{ base: "column", md: "row" }}
              justifyContent="flex-end"
            >
              <Link href={`/coinLaundry/${storeId ? storeId : ""}`}>
                <Button
                  variant="outline"
                  w={{ base: "full", md: "auto" }}
                  minW={{ md: "120px" }}
                  fontWeight="semibold"
                  py={2}
                  px={6}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="var(--divider, #F1F5F9)"
                  bg="white"
                  color="var(--text-muted, #64748B)"
                  transition="all 0.2s"
                  _hover={{ bg: "var(--app-bg, #F0F9FF)" }}
                >
                  キャンセル
                </Button>
              </Link>
              <CheckDialog
                method={method}
                postHander={postHander}
                dialogRef={dialogRef}
              />
            </Flex>
          </Box>
        </form>
      </Box>
    </Flex>
  );
};

export default CoinLaundryForm;
