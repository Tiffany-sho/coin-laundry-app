"use client";

import {
  VStack,
  Text,
  HStack,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Box,
  Heading,
  Switch,
  Badge,
  Textarea,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { useMachinesEdit } from "./useMachinesEdit";

const MachinesDialog = ({ initialData }) => {
  const {
    data,
    machines,
    isSaving,
    breakMachine,
    changeMachineState,
    handleSave,
    resetMachines,
  } = useMachinesEdit(initialData);

  return (
    <Dialog.Root
      onOpenChange={(e) => {
        if (e.open) resetMachines();
      }}
    >
      {/* トリガーカード：故障状態を示す赤系は意味的に維持 */}
      <Dialog.Trigger asChild>
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor="red.200"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            boxShadow: "md",
            borderColor: "red.300",
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <HStack gap={2}>
                <Icon.LiaStoreSolid color="var(--chakra-colors-red-500)" size={18} />
                <Text fontSize="sm" fontWeight="bold" color="var(--text-main, #1E3A5F)">
                  {data.laundryName}
                </Text>
              </HStack>
              <Badge bg="red.100" color="red.700" fontSize="xs" px={2} py={0.5} borderRadius="full">
                {breakMachine.length}台故障
              </Badge>
            </HStack>

            <VStack align="stretch" gap={1} pl={2}>
              {breakMachine.slice(0, 3).map((machine) => (
                <HStack key={machine.id} gap={2}>
                  <Box w="4px" h="4px" bg="red.500" borderRadius="full" />
                  <Text fontSize="xs" color="red.700" fontWeight="medium">
                    {machine.name}
                  </Text>
                  {machine.comment && (
                    <Text fontSize="xs" color="red.700" fontWeight="medium" bg="red.50" px={2} py={1} borderRadius="md">
                      {machine.comment}
                    </Text>
                  )}
                </HStack>
              ))}
              {breakMachine.length > 3 && (
                <Text fontSize="xs" color="red.600" pl={4}>
                  他 {breakMachine.length - 3}台
                </Text>
              )}
            </VStack>
          </VStack>
        </Box>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="20px"
            maxW="lg"
            bg="white"
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
                  <Icon.LuWrench size={20} />
                </Box>
                <Dialog.Title fontSize="xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
                  設備状態管理（{data.laundryName}店）
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={4}
                right={4}
                bg="white"
                borderRadius="full"
                _hover={{ bg: "cyan.50" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6} maxH="60vh" overflowY="auto">
              <VStack align="stretch" gap={4}>
                {machines.map((machine) => (
                  <Box
                    key={machine.id}
                    p={5}
                    bg={machine.break ? "red.50" : "var(--app-bg, #F0F9FF)"}
                    borderRadius="14px"
                    border="2px solid"
                    borderColor={machine.break ? "red.200" : "var(--divider, #F1F5F9)"}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Heading size="sm" color="var(--text-main, #1E3A5F)">
                            {machine.name}
                          </Heading>
                          <Badge
                            bg={machine.break ? "red.300" : "cyan.200"}
                            color={machine.break ? "red.900" : "var(--teal-deeper, #155E75)"}
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {machine.break ? "故障中" : "稼働中"}
                          </Badge>
                        </VStack>
                        <Switch.Root
                          checked={machine.break}
                          onCheckedChange={(e) => changeMachineState(e, machine.id, "switch")}
                          size="lg"
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      </HStack>

                      {machine.break && (
                        <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="red.200">
                          <VStack align="stretch" gap={3}>
                            <Text fontSize="sm" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                              故障内容
                            </Text>
                            <Textarea
                              placeholder="故障の詳細を入力してください..."
                              value={machine.comment || ""}
                              onChange={(e) => changeMachineState(e, machine.id, "input")}
                              rows={3}
                              resize="vertical"
                              borderColor="red.200"
                              _focus={{
                                borderColor: "red.400",
                                boxShadow: "0 0 0 1px var(--chakra-colors-red-400)",
                              }}
                            />
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer borderTop="1px solid" borderColor="var(--divider, #F1F5F9)" p={6} gap={3}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  px={6}
                  borderColor="var(--divider, #F1F5F9)"
                  color="var(--text-muted, #64748B)"
                  _hover={{ bg: "var(--app-bg, #F0F9FF)" }}
                  onClick={resetMachines}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
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
                  _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
                  transition="all 0.2s"
                >
                  保存
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default MachinesDialog;
