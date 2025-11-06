"use client";

import {
  Button,
  Card,
  Flex,
  Stack,
  Text,
  HStack,
  IconButton,
  NumberInput,
  Textarea,
  Box,
} from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";
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
      <Box bg="gray.700" color="white" px={6} py={4} borderRadius="12px" mb={5}>
        <Flex justifyContent="space-between" align="center" gap={4}>
          <Text color="gray.200" fontSize="sm" fontWeight="medium" flex="1">
            機械の削除は個数を0にすると自動的に削除されます
          </Text>
          <PropoverForm />
        </Flex>
      </Box>
      <Stack gap="6" w="full">
        {state.machines.map((machine) => {
          return (
            <Box
              key={machine.name}
              bg="white"
              p={5}
              borderRadius="12px"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              transition="all 0.2s"
            >
              <Flex direction="column" gap="4">
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.700"
                  letterSpacing="tight"
                >
                  {machine.name}
                </Text>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
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
                            borderColor="gray.300"
                            color="gray.700"
                            transition="all 0.2s"
                            onClick={() => handleCountChange(machine.name, -1)}
                          >
                            <LuMinus />
                          </IconButton>
                        </NumberInput.DecrementTrigger>
                      ) : (
                        <IconButton
                          variant="outline"
                          size="md"
                          bg="white"
                          borderColor="gray.300"
                          color="gray.700"
                          transition="all 0.2s"
                          disabled={true}
                          onClick={() => handleCountChange(machine.name, -1)}
                        >
                          <LuMinus />
                        </IconButton>
                      )}

                      <NumberInput.ValueText
                        textAlign="center"
                        fontSize="2xl"
                        fontWeight="bold"
                        minW="4ch"
                        color="gray.700"
                        px={4}
                        py={2}
                        bg="gray.100"
                        borderRadius="8px"
                      >
                        {machine.num === 0 ? "0" : machine.num}
                      </NumberInput.ValueText>

                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          variant="outline"
                          size="md"
                          bg="white"
                          borderColor="gray.300"
                          color="gray.700"
                          transition="all 0.2s"
                          onClick={() => handleCountChange(machine.name, 1)}
                        >
                          <LuPlus />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.600"
                    mb={2}
                  >
                    価格帯・コメント
                  </Text>
                  <Textarea
                    onChange={(e) =>
                      handleCommentChange(machine.name, e.target.value)
                    }
                    value={machine.comment}
                    placeholder="例) 20kg/1000円, 8分/100円"
                    resize="none"
                    h="20"
                    borderColor="gray.300"
                    borderRadius="8px"
                    _focus={{
                      borderColor: "gray.700",
                      boxShadow: "0 0 0 1px var(--chakra-colors-gray-700)",
                    }}
                    _placeholder={{
                      color: "gray.400",
                    }}
                    fontSize="sm"
                    bg="white"
                  />
                </Box>
              </Flex>
            </Box>
          );
        })}
      </Stack>

      <Button variant="solid" onClick={() => setOpen(false)} w="100%">
        完了
      </Button>
    </>
  );
};

export default MachineForm;
