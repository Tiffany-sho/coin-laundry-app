"use client";

import {
  Button,
  Flex,
  Stack,
  Text,
  HStack,
  IconButton,
  NumberInput,
  Textarea,
  Box,
} from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import PropoverForm from "./PropoverForm";
import { useCoinLaundryForm } from "@/app/feacher/coinLandry/context/CoinlaundryForm/CoinLaundryFormContext";

const MachineForm = ({ setOpen }) => {
  const { state, dispatch } = useCoinLaundryForm();

  const handleCountChange = (machineName, amount) => {
    dispatch({
      type: "UPDATE_MACHINE_COUNT",
      payload: { name: machineName, amount },
    });
  };
  const handleCommentChange = (machineName, comment) => {
    dispatch({
      type: "ADD_MACHINES_COMMENT",
      payload: { name: machineName, comment },
    });
  };

  return (
    <>
      <Box
        style={{ background: "linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)" }}
        color="white"
        px={6}
        py={4}
        borderRadius="14px"
        mb={5}
      >
        <Flex justifyContent="space-between" align="center" gap={4}>
          <Text color="rgba(255,255,255,0.80)" fontSize="sm" fontWeight="medium" flex="1">
            機械の削除は個数を0にすると自動的に削除されます
          </Text>
          <PropoverForm />
        </Flex>
      </Box>

      <Stack gap="6" w="full">
        {state.machines.map((machine) => (
          <Box
            key={machine.name}
            bg="white"
            p={5}
            borderRadius="14px"
            boxShadow="var(--shadow-sm)"
            border="1.5px solid"
            borderColor="var(--divider, #F1F5F9)"
            transition="all 0.2s"
          >
            <Flex direction="column" gap="4">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="var(--text-main, #1E3A5F)"
                letterSpacing="tight"
              >
                {machine.name}
              </Text>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-muted, #64748B)"
                  mb={2}
                >
                  個数
                </Text>
                <NumberInput.Root unstyled spinOnPress={false}>
                  <HStack gap="3" justify="center">
                    {machine.num !== 0 ? (
                      <NumberInput.DecrementTrigger asChild>
                        <IconButton
                          variant="outline"
                          size="md"
                          bg="white"
                          borderColor="var(--divider, #F1F5F9)"
                          color="var(--text-muted, #64748B)"
                          transition="all 0.2s"
                          _hover={{ borderColor: "cyan.400", color: "var(--teal, #0891B2)" }}
                          onClick={() => handleCountChange(machine.name, -1)}
                        >
                          <Icon.LuMinus />
                        </IconButton>
                      </NumberInput.DecrementTrigger>
                    ) : (
                      <IconButton
                        variant="outline"
                        size="md"
                        bg="white"
                        borderColor="var(--divider, #F1F5F9)"
                        color="var(--text-faint, #94A3B8)"
                        transition="all 0.2s"
                        disabled={true}
                      >
                        <Icon.LuMinus />
                      </IconButton>
                    )}

                    <NumberInput.ValueText
                      textAlign="center"
                      fontSize="2xl"
                      fontWeight="bold"
                      minW="4ch"
                      color="var(--teal-deeper, #155E75)"
                      px={4}
                      py={2}
                      bg="var(--teal-pale, #CFFAFE)"
                      borderRadius="10px"
                    >
                      {machine.num === 0 ? "0" : machine.num}
                    </NumberInput.ValueText>

                    <NumberInput.IncrementTrigger asChild>
                      <IconButton
                        variant="outline"
                        size="md"
                        bg="white"
                        borderColor="var(--divider, #F1F5F9)"
                        color="var(--text-muted, #64748B)"
                        transition="all 0.2s"
                        _hover={{ borderColor: "cyan.400", color: "var(--teal, #0891B2)" }}
                        onClick={() => handleCountChange(machine.name, 1)}
                      >
                        <Icon.LuPlus />
                      </IconButton>
                    </NumberInput.IncrementTrigger>
                  </HStack>
                </NumberInput.Root>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="var(--text-muted, #64748B)"
                  mb={2}
                >
                  価格帯・コメント
                </Text>
                <Textarea
                  onChange={(e) => handleCommentChange(machine.name, e.target.value)}
                  value={machine.comment}
                  placeholder="例) 20kg/1000円, 8分/100円"
                  resize="none"
                  h="20"
                  border="1.5px solid"
                  borderColor="var(--divider, #F1F5F9)"
                  borderRadius="10px"
                  _focus={{
                    borderColor: "cyan.500",
                    boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
                    outline: "none",
                  }}
                  _placeholder={{ color: "var(--text-faint, #94A3B8)" }}
                  fontSize="sm"
                  bg="white"
                />
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>

      <Button
        mt={4}
        w="100%"
        color="white"
        style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
        fontWeight="bold"
        borderRadius="lg"
        boxShadow="0 4px 14px rgba(8, 145, 178, 0.28)"
        _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8, 145, 178, 0.36)" }}
        transition="all 0.2s"
        onClick={() => setOpen(false)}
      >
        完了
      </Button>
    </>
  );
};

export default MachineForm;
