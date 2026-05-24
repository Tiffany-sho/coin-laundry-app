"use client";

import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import Link from "next/link";

import * as Icon from "@/app/feacher/Icon";
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

const SectionLabel = ({ icon, children }) => (
  <HStack mb={3} gap={2}>
    <Box color="var(--teal, #0891B2)">{icon}</Box>
    <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
      {children}
    </Text>
  </HStack>
);

const CoinLaundryForm = ({ storeId, images = [], method }) => {
  const { state, dispatch } = useCoinLaundryForm();
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
  const dialogRef = useRef(null);

  const { postHander } = useStoreSubmit({ storeId, images, method, formRef, dialogRef });

  return (
    <Flex
      justify="center"
      minH="100vh"
      pt={{ base: 6, md: 12 }}
      pb={{ base: 32, md: 16 }}
      px={{ base: 4, md: 6 }}
      bg="var(--app-bg, #F0F9FF)"
    >
      <Box w="full" maxW="640px">
        <form ref={formRef}>
          <Box
            bg="var(--card-bg, #FFFFFF)"
            borderRadius="2xl"
            boxShadow="var(--shadow-sm)"
            overflow="hidden"
            border="1px solid rgba(8, 145, 178, 0.10)"
          >
            {/* グラデーションヘッダー */}
            <Box
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              px={{ base: 6, md: 8 }}
              py={6}
            >
              <HStack gap={3}>
                <Box
                  bg="rgba(255,255,255,0.18)"
                  borderRadius="lg"
                  p={2.5}
                  color="white"
                >
                  <Icon.LiaStoreSolid size={20} />
                </Box>
                <Box>
                  <Text fontSize="xs" color="rgba(255,255,255,0.7)" fontWeight="medium" mb={0.5}>
                    店舗{method === "POST" ? "登録" : "編集"}
                  </Text>
                  <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="white" lineHeight="1.3">
                    {method === "POST" ? "新しい店舗を追加" : "店舗情報を更新"}
                  </Heading>
                </Box>
              </HStack>
            </Box>

            {/* フォーム本体 */}
            <Stack gap={6} p={{ base: 5, md: 7 }}>
              {state.msg && (
                <Box
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

              {/* 店舗名 */}
              <Field.Root>
                <SectionLabel icon={<Icon.LiaStoreSolid size={15} />}>店舗名</SectionLabel>
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
                    value={state.store}
                    placeholder="例) 四条河原町"
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
                      dispatch({ type: "SET_FORM_DATA", payload: { field: "store", value: e.target.value } })
                    }
                  />
                </InputGroup>
              </Field.Root>

              {/* 場所 */}
              <Field.Root>
                <SectionLabel icon={<Icon.PiMapPin size={15} />}>場所</SectionLabel>
                <Input
                  type="text"
                  name="location"
                  value={state.location}
                  placeholder="例) 京都府京都市下京区"
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
                    dispatch({ type: "SET_FORM_DATA", payload: { field: "location", value: e.target.value } })
                  }
                />
              </Field.Root>

              {/* 概要 */}
              <Field.Root>
                <SectionLabel icon={<Icon.LuFileText size={15} />}>概要</SectionLabel>
                <Textarea
                  name="description"
                  resize="none"
                  h="24"
                  value={state.description}
                  placeholder="例) デパートやブティックだけでなく、着物や書道具を商う古くからの店が並ぶ繁華街です。"
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
                    dispatch({ type: "SET_FORM_DATA", payload: { field: "description", value: e.target.value } })
                  }
                />
              </Field.Root>

              {/* 機械選択 */}
              <Box>
                <SectionLabel icon={<Icon.LuWrench size={15} />}>機械</SectionLabel>
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
                      _hover={{ bg: "cyan.100", borderColor: "var(--teal, #0891B2)" }}
                      onClick={() => setOpen((prev) => !prev)}
                    >
                      {open ? "選択中..." : "機械を選択"}
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
                                bg="var(--card-bg, #FFFFFF)"
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
              </Box>

              {/* 写真 */}
              <Box>
                <SectionLabel icon={<Icon.LuFileImage size={15} />}>写真</SectionLabel>
                <Stack gap={3}>
                  <UploadPicture />
                  <DeletePicture />
                </Stack>
              </Box>
            </Stack>

            {/* フッターボタン */}
            <Flex
              px={{ base: 5, md: 7 }}
              pb={{ base: 6, md: 7 }}
              pt={4}
              gap={3}
              direction={{ base: "column", md: "row" }}
              justifyContent="flex-end"
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
            >
              <Link href={`/coinLaundry/${storeId ?? ""}`}>
                <Button
                  variant="outline"
                  w={{ base: "full", md: "auto" }}
                  minW={{ md: "120px" }}
                  fontWeight="semibold"
                  borderRadius="lg"
                  border="1.5px solid"
                  borderColor="var(--divider, #F1F5F9)"
                  bg="var(--card-bg, #FFFFFF)"
                  color="var(--text-muted, #64748B)"
                  transition="all 0.2s"
                  _hover={{ bg: "var(--app-bg, #F0F9FF)", borderColor: "cyan.200" }}
                >
                  キャンセル
                </Button>
              </Link>
              <Box w={{ base: "full", md: "auto" }}>
                <CheckDialog method={method} postHander={postHander} dialogRef={dialogRef} />
              </Box>
            </Flex>
          </Box>
        </form>
      </Box>
    </Flex>
  );
};

export default CoinLaundryForm;
