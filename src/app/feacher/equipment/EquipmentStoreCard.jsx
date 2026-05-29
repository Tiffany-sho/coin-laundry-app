"use client";
import { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Heading,
  Badge,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { updateMachinesState } from "@/app/api/supabaseFunctions/supabaseDatabase/laundryState/action";
import { showToast } from "@/functions/makeToast/toast";

export default function EquipmentStoreCard({ storeState, canEdit }) {
  const [machines, setMachines] = useState(storeState.machines ?? []);
  const [editMachines, setEditMachines] = useState(storeState.machines ?? []);
  const [isSaving, setIsSaving] = useState(false);

  const brokenCount = machines.filter((m) => m.break).length;
  const hasBreak = brokenCount > 0;

  const handleOpen = () => {
    setEditMachines(machines.map((m) => ({ ...m })));
  };

  const changeMachineState = (machineId, action, value) => {
    setEditMachines((prev) =>
      prev.map((machine) => {
        if (machine.id !== machineId) return machine;
        if (action === "switch") {
          return { ...machine, break: value, comment: value ? machine.comment : "" };
        }
        if (action === "comment") {
          return { ...machine, comment: value };
        }
        return machine;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateMachinesState(storeState.laundryId, editMachines);
    if (error) {
      showToast("error", `${storeState.laundryName}店の設備状態の更新に失敗しました`);
    } else {
      setMachines(editMachines.map((m) => ({ ...m })));
      showToast("success", `${storeState.laundryName}店の設備状態を更新しました`);
    }
    setIsSaving(false);
  };

  return (
    <Dialog.Root onOpenChange={(e) => { if (e.open) handleOpen(); }}>
      <Dialog.Trigger asChild>
        <Box
          bg={hasBreak ? "orange.50" : "cyan.50"}
          border="2px solid"
          borderColor={hasBreak ? "orange.200" : "cyan.200"}
          borderRadius="xl"
          p={4}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md",
            bg: hasBreak ? "orange.100" : "cyan.100",
          }}
        >
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1}>
              <Text fontWeight="bold" fontSize="sm" color="var(--text-main)">
                {storeState.laundryName}店
              </Text>
              <HStack gap={2} flexWrap="wrap">
                {hasBreak ? (
                  <>
                    {machines.filter((m) => m.break).slice(0, 2).map((m) => (
                      <Badge
                        key={m.id}
                        bg="orange.100"
                        color="orange.700"
                        fontSize="xs"
                        borderRadius="full"
                        px={2}
                      >
                        {m.name.slice(0, 8)} 故障中
                      </Badge>
                    ))}
                    {brokenCount > 2 && (
                      <Badge
                        bg="orange.100"
                        color="orange.700"
                        fontSize="xs"
                        borderRadius="full"
                        px={2}
                      >
                        他{brokenCount - 2}台
                      </Badge>
                    )}
                  </>
                ) : (
                  <Text fontSize="xs" color="cyan.700" fontWeight="medium">
                    全{machines.length}台稼働中
                  </Text>
                )}
              </HStack>
            </VStack>
            <Box
              bg={hasBreak ? "orange.500" : "cyan.500"}
              color="white"
              borderRadius="full"
              p={1.5}
            >
              {hasBreak ? <Icon.CiCircleAlert size={16} /> : <Icon.LuCheck size={16} />}
            </Box>
          </HStack>
        </Box>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="20px"
            maxW="lg"
            bg="var(--card-bg, #FFFFFF)"
            boxShadow="0 12px 40px rgba(14,116,144,0.18)"
          >
            <Dialog.Header
              bg="var(--teal-pale, #CFFAFE)"
              borderBottom="1px solid rgba(8,145,178,0.15)"
              p={6}
            >
              <HStack gap={3}>
                <Box
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                  color="white"
                  borderRadius="full"
                  p={2}
                >
                  <Icon.LuWrench size={18} />
                </Box>
                <Dialog.Title fontSize="xl" fontWeight="bold" color="var(--teal-deeper)">
                  設備状態管理（{storeState.laundryName}店）
                </Dialog.Title>
              </HStack>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                bg="var(--card-bg)"
                borderRadius="full"
                _hover={{ bg: "cyan.50" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6} maxH="60vh" overflowY="auto">
              <VStack gap={4}>
                {editMachines.length === 0 ? (
                  <Text
                    color="var(--text-muted)"
                    fontSize="sm"
                    textAlign="center"
                    py={4}
                  >
                    登録された機器がありません
                  </Text>
                ) : (
                  editMachines.map((machine) => (
                    <Box
                      key={machine.id}
                      p={5}
                      bg={machine.break ? "orange.50" : "cyan.50"}
                      borderRadius="14px"
                      border="2px solid"
                      borderColor={machine.break ? "orange.200" : "cyan.200"}
                      transition="all 0.2s"
                      w="full"
                    >
                      <VStack align="stretch" gap={4}>
                        <HStack justify="space-between">
                          <VStack align="start" gap={1}>
                            <Heading size="sm" color="var(--text-main)">
                              {machine.name}
                            </Heading>
                            <Badge
                              bg={machine.break ? "orange.300" : "cyan.200"}
                              color={machine.break ? "orange.900" : "var(--teal-deeper)"}
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              {machine.break ? "故障中" : "稼働中"}
                            </Badge>
                          </VStack>
                          {canEdit && (
                            <Switch.Root
                              checked={machine.break}
                              onCheckedChange={(e) =>
                                changeMachineState(machine.id, "switch", e.checked)
                              }
                              size="lg"
                            >
                              <Switch.HiddenInput />
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch.Root>
                          )}
                        </HStack>

                        {machine.break && (
                          <Box
                            p={4}
                            bg="var(--card-bg, #FFFFFF)"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="orange.200"
                          >
                            <VStack align="stretch" gap={3}>
                              <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                                故障内容
                              </Text>
                              {canEdit ? (
                                <Textarea
                                  fontSize="15px"
                                  placeholder="故障の詳細を入力してください..."
                                  value={machine.comment || ""}
                                  onChange={(e) =>
                                    changeMachineState(machine.id, "comment", e.target.value)
                                  }
                                  rows={3}
                                  resize="vertical"
                                  borderColor="orange.200"
                                  _focus={{
                                    borderColor: "orange.400",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)",
                                  }}
                                />
                              ) : (
                                <Text fontSize="sm" color="var(--text-muted)">
                                  {machine.comment || "（詳細なし）"}
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="var(--divider, #F1F5F9)"
              p={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  px={6}
                  borderColor="var(--divider)"
                  color="var(--text-muted)"
                  _hover={{ bg: "var(--app-bg)" }}
                >
                  {canEdit ? "キャンセル" : "閉じる"}
                </Button>
              </Dialog.ActionTrigger>
              {canEdit && (
                <Dialog.ActionTrigger asChild>
                  <Button
                    size="lg"
                    onClick={handleSave}
                    loading={isSaving}
                    borderRadius="full"
                    px={8}
                    color="white"
                    style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                    boxShadow="0 4px 14px rgba(8,145,178,0.28)"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 18px rgba(8,145,178,0.36)",
                    }}
                    transition="all 0.2s"
                  >
                    保存
                  </Button>
                </Dialog.ActionTrigger>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
