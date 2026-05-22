"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Input,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { redirect } from "next/navigation";
import { LuTrash2, CiCircleAlert } from "@/app/feacher/Icon";
import { deleteStore } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { hasStoreFunds } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { showToast } from "@/functions/makeToast/toast";

const STEP = { CONFIRM: "confirm", DATA_WARNING: "data_warning", NAME_INPUT: "name_input" };

const DeleteStoreDialog = ({ id, store }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEP.CONFIRM);
  const [nameInput, setNameInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = () => {
    setStep(STEP.CONFIRM);
    setNameInput("");
    setOpen(true);
  };

  const handleClose = () => {
    if (isChecking || isDeleting) return;
    setOpen(false);
  };

  const handleFirstConfirm = async () => {
    setIsChecking(true);
    const { has } = await hasStoreFunds(id);
    setIsChecking(false);
    setStep(has ? STEP.DATA_WARNING : STEP.NAME_INPUT);
  };

  const handleDelete = async () => {
    if (nameInput !== store) return;
    setIsDeleting(true);
    const { data, error } = await deleteStore(id);
    if (error) {
      showToast("error", "店舗の削除に失敗しました");
      setIsDeleting(false);
      setOpen(false);
      return;
    }
    showToast("warning", `${data.store}店を削除しました`);
    redirect("/coinLaundry");
  };

  const isNameMatch = nameInput === store;

  return (
    <>
      <Button color="red.500" variant="outline" size="md" border="none" onClick={handleOpen}>
        <LuTrash2 />
        <span>削除</span>
      </Button>

      <Dialog.Root
        role="alertdialog"
        open={open}
        onOpenChange={(e) => { if (!e.open) handleClose(); }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="440px" mx={4} borderRadius="xl">

              {/* ステップ1: 基本確認 */}
              {step === STEP.CONFIRM && (
                <>
                  <Dialog.Header>
                    <Dialog.Title>{`「${store}店」を削除しますか？`}</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Text color="var(--text-muted, #64748B)">
                      削除すると復活させることはできません。
                    </Text>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="outline" onClick={handleClose}>
                      キャンセル
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={handleFirstConfirm}
                      disabled={isChecking}
                      minW="100px"
                    >
                      {isChecking ? <Spinner size="sm" /> : "削除する"}
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={handleClose} />
                  </Dialog.CloseTrigger>
                </>
              )}

              {/* ステップ2: 集金データあり警告（データがある場合のみ） */}
              {step === STEP.DATA_WARNING && (
                <>
                  <Dialog.Header>
                    <HStack gap={2}>
                      <Box color="orange.500">
                        <CiCircleAlert size={22} />
                      </Box>
                      <Dialog.Title color="orange.600">集金データが存在します</Dialog.Title>
                    </HStack>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={3}>
                      <Text fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                        「{store}店」には集金データが存在します。
                      </Text>
                      <Box
                        p={3}
                        bg="red.50"
                        borderLeft="4px solid"
                        borderColor="red.400"
                        borderRadius="md"
                      >
                        <Text color="red.700" fontSize="sm">
                          店舗を削除すると、全ての集金データも削除されます。
                          本当に削除しますか？
                        </Text>
                      </Box>
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="outline" onClick={handleClose}>
                      キャンセル
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={() => setStep(STEP.NAME_INPUT)}
                    >
                      削除を続ける
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={handleClose} />
                  </Dialog.CloseTrigger>
                </>
              )}

              {/* ステップ3: 店舗名入力による最終確認 */}
              {step === STEP.NAME_INPUT && (
                <>
                  <Dialog.Header>
                    <Dialog.Title color="red.600">最終確認</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={4}>
                      <Text color="var(--text-muted, #64748B)" fontSize="sm">
                        削除を確定するには、店舗名を入力してください。
                      </Text>
                      <Box
                        p={3}
                        bg="var(--teal-pale, #CFFAFE)"
                        borderRadius="md"
                        textAlign="center"
                      >
                        <Text fontWeight="bold" fontSize="lg" color="var(--text-main, #1E3A5F)">
                          {store}
                        </Text>
                      </Box>
                      <Input
                        placeholder={`「${store}」と入力`}
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        borderColor={isNameMatch ? "green.400" : undefined}
                        borderWidth="1.5px"
                        borderRadius="lg"
                        fontSize="16px"
                        autoFocus
                        _focus={{
                          borderColor: isNameMatch ? "green.400" : "cyan.500",
                          boxShadow: isNameMatch
                            ? "0 0 0 2px rgba(72,187,120,0.20)"
                            : "0 0 0 2px rgba(8,145,178,0.20)",
                        }}
                      />
                      {nameInput.length > 0 && !isNameMatch && (
                        <Text fontSize="xs" color="red.500">
                          店舗名が一致しません
                        </Text>
                      )}
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      disabled={isDeleting}
                    >
                      キャンセル
                    </Button>
                    <Button
                      colorPalette="red"
                      onClick={handleDelete}
                      disabled={!isNameMatch || isDeleting}
                      minW="100px"
                    >
                      {isDeleting ? <Spinner size="sm" /> : "削除する"}
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={handleClose} disabled={isDeleting} />
                  </Dialog.CloseTrigger>
                </>
              )}

            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default DeleteStoreDialog;
