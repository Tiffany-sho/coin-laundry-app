"use client";

import { useEffect } from "react";
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
import { useMachinesState } from "./useMachinesState";

const MachinesState = ({ id, onLoad }) => {
  const {
    data,
    isSaving,
    isLoading,
    machines,
    breakMachine,
    changeMachineState,
    handleSave,
    resetMachines,
  } = useMachinesState(id);

  useEffect(() => {
    if (!isLoading) onLoad?.();
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return null;

  if (!data)
    return (
      <Box
        bg="red.50"
        p={3}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="red.500"
      >
        <Text fontSize="sm" color="red.600" fontWeight="medium">
          データを入手できませんでした
        </Text>
      </Box>
    );

  return (
    <Dialog.Root
      onOpenChange={(e) => {
        if (e.open) resetMachines();
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg={breakMachine.length === 0 ? "green.50" : "red.50"}
          p={3}
          borderRadius="lg"
          borderColor={breakMachine.length === 0 ? "green.200" : "red.200"}
          borderWidth="0.5px"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: breakMachine.length === 0 ? "green.100" : "red.100",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack>
              <Box
                bg={breakMachine.length === 0 ? "green.500" : "red.500"}
                color="white"
                borderRadius="full"
                p={1}
              >
                {breakMachine.length === 0 ? (
                  <Icon.LuCheck size={14} />
                ) : (
                  <Icon.CiCircleAlert size={14} />
                )}
              </Box>
              {breakMachine.length === 0 ? (
                <Text fontSize="xs" fontWeight="semibold" color="green.700">
                  フル稼働中
                </Text>
              ) : (
                <Text fontSize="xs" color="red.700" fontWeight="semibold">
                  故障 {breakMachine.length}台
                </Text>
              )}
            </HStack>
            {breakMachine.length === 0 ? (
              <Text fontSize="xs" color="green.700" fontWeight="medium">
                異常なし
              </Text>
            ) : (
              <HStack align="stretch">
                {breakMachine.slice(0, 1).map((machine, index) => (
                  <Text
                    key={index}
                    fontSize="xs"
                    color="red.700"
                    fontWeight="medium"
                  >
                    {machine.name.slice(0, 5)}
                  </Text>
                ))}
                {breakMachine.length > 1 && (
                  <Text fontSize="xs" color="red.700" fontWeight="medium">
                    他 {breakMachine.length - 1}台
                  </Text>
                )}
              </HStack>
            )}
          </VStack>
        </Box>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="16px"
            maxW="lg"
            bg="white"
            boxShadow="xl"
          >
            <Dialog.Header
              bg="orange.50"
              borderBottom="1px solid"
              borderColor="orange.200"
              p={6}
            >
              <HStack gap={3}>
                <Box bg="orange.500" color="white" borderRadius="full" p={2}>
                  <Icon.LuWrench size={20} />
                </Box>
                <Dialog.Title
                  fontSize="xl"
                  fontWeight="bold"
                  color="orange.900"
                >
                  設備状態管理({data.laundryName}店)
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
                _hover={{ bg: "orange.50" }}
              />
            </Dialog.CloseTrigger>

            <Dialog.Body p={6} maxH="60vh" overflowY="auto">
              <VStack align="stretch" gap={4}>
                {machines.map((machine) => (
                  <Box
                    key={machine.id}
                    p={5}
                    bg={machine.break ? "red.50" : "gray.50"}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor={machine.break ? "red.200" : "gray.200"}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between">
                        <VStack align="start" gap={1}>
                          <Heading size="sm" color="gray.800">
                            {machine.name}
                          </Heading>
                          <Badge
                            bg={machine.break ? "red.300" : "green.300"}
                            fontSize="xs"
                            px={2}
                            py={1}
                          >
                            {machine.break ? "故障中" : "稼働中"}
                          </Badge>
                        </VStack>

                        <Box>
                          <Switch.Root
                            checked={machine.break}
                            onCheckedChange={(e) =>
                              changeMachineState(e, machine.id, "switch")
                            }
                            size="lg"
                          >
                            <Switch.HiddenInput />
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch.Root>
                        </Box>
                      </HStack>

                      {machine.break && (
                        <Box
                          p={4}
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="red.200"
                        >
                          <VStack align="stretch" gap={3}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.700"
                            >
                              故障内容
                            </Text>
                            <Textarea
                              fontSize="15px"
                              placeholder="故障の詳細を入力してください..."
                              value={machine.comment || ""}
                              onChange={(e) =>
                                changeMachineState(e, machine.id, "input")
                              }
                              rows={3}
                              resize="vertical"
                              borderColor="red.200"
                              _focus={{
                                borderColor: "red.400",
                                boxShadow:
                                  "0 0 0 1px var(--chakra-colors-red-400)",
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

            <Dialog.Footer
              borderTop="1px solid"
              borderColor="gray.200"
              p={6}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  borderRadius="full"
                  px={6}
                  onClick={resetMachines}
                >
                  キャンセル
                </Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button
                  size="lg"
                  variant="solid"
                  onClick={handleSave}
                  loading={isSaving}
                  borderRadius="full"
                  px={8}
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

export default MachinesState;
