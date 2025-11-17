"use client";
import { createClient } from "@/utils/supabase/client";
import {
  VStack,
  Text,
  HStack,
  Spinner,
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
import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import * as Icon from "@/app/feacher/Icon";

const MachinesState = ({ id }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [machines, setMachines] = useState([]);
  const [breakMachine, setBreakMachine] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const { data: initialData, error: initialError } = await supabase
        .from("laundry_state")
        .select("*")
        .eq("laundryId", id)
        .single();

      if (initialError) {
        setError(initialError.message);
        setData(null);
      } else {
        setData(initialData);
        setMachines(initialData.machines);
        setError(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!data) return;

    const alreadryBreakMachine = data.machines.filter(
      (machine) => machine.break
    );
    setBreakMachine(alreadryBreakMachine);
  }, [data]);

  const changeMachineState = (e, id, action) => {
    setMachines((prev) =>
      prev.map((machine) => {
        if (action === "switch") {
          if (machine.id === id) {
            if (!e.checked && machine.comment) {
              return { ...machine, break: e.checked, comment: "" };
            }
            return { ...machine, break: e.checked };
          } else {
            return machine;
          }
        } else if (action === "input") {
          if (machine.id === id) {
            return { ...machine, comment: e.target.value };
          } else {
            return machine;
          }
        } else {
          return machine;
        }
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("laundry_state")
      .update({
        machines: machines,
      })
      .eq("laundryId", id);

    if (error) {
      toaster.create({
        description: "設備状態の更新に失敗しました",
        type: "error",
      });
    } else {
      setData((prev) => ({
        ...prev,
        machines: machines,
      }));
      toaster.create({
        description: "設備状態を更新しました",
        type: "success",
      });
    }
    setIsSaving(false);
  };

  if (loading)
    return (
      <Box
        bg="orange.50"
        p={3}
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="orange.400"
      >
        <VStack>
          <Spinner size="sm" color="orange.500" />
          <Text fontSize="xs" color="gray.600">
            読み込み中...
          </Text>
        </VStack>
      </Box>
    );

  if (error)
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
        if (e.open) {
          setMachines(data.machines);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Box
          bg={breakMachine.length === 0 ? "green.50" : "red.50"}
          p={3}
          borderRadius="lg"
          borderLeft="4px solid"
          borderColor={breakMachine.length === 0 ? "green.500" : "red.500"}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            bg: breakMachine.length === 0 ? "green.100" : "red.100",
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
        >
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                設備状況
              </Text>
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
            </HStack>

            {breakMachine.length === 0 ? (
              <VStack align="stretch" gap={1}>
                <Text fontSize="md" fontWeight="bold" color="green.700">
                  フル稼働中
                </Text>
                <Text fontSize="xs" color="green.600">
                  すべての設備が正常です
                </Text>
              </VStack>
            ) : (
              <VStack align="stretch" gap={2}>
                <HStack>
                  <Badge
                    bg="red.300"
                    fontSize="xs"
                    px={2}
                    py={1}
                    fontWeight="bold"
                  >
                    故障 {breakMachine.length}台
                  </Badge>
                </HStack>
                {breakMachine.slice(0, 2).map((machine, index) => (
                  <Text
                    key={index}
                    fontSize="xs"
                    color="red.700"
                    fontWeight="medium"
                  >
                    • {machine.name}
                  </Text>
                ))}
                {breakMachine.length > 2 && (
                  <Text fontSize="xs" color="red.600">
                    他 {breakMachine.length - 2}台
                  </Text>
                )}
              </VStack>
            )}

            <Text fontSize="2xs" color="gray.500" mt={1}>
              タップして詳細を確認
            </Text>
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
                  設備状態管理
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
                {machines.map((machine) => {
                  return (
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
                              {machine.comment && (
                                <HStack>
                                  <Badge bg="blue.200" fontSize="2xs">
                                    {machine.comment.length}文字
                                  </Badge>
                                </HStack>
                              )}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
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
                  onClick={() => setMachines(data.machines)}
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
