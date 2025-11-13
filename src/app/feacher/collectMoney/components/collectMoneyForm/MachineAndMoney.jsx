"use client";

import {
  Button,
  InputGroup,
  NumberInput,
  Stack,
  Box,
  Text,
  Flex,
} from "@chakra-ui/react";

import { FaArrowsRotate } from "react-icons/fa6";

const coinWeight = 4.8;

const MachineAndMoney = ({ machinesAndFunds, setMachinesAndFunds }) => {
  const hander = (machine, action, event) => {
    setMachinesAndFunds((prevMachines) => {
      return prevMachines.map((prevMachine) => {
        if (prevMachine.machine.name === machine) {
          if (action === "inputCoin") {
            const coins = parseInt(event.value);
            if (!coins) {
              return { ...prevMachine, funds: null };
            }
            return { ...prevMachine, funds: coins };
          } else if (action === "inputWeight") {
            const weight = parseInt(event.value);
            if (!weight) {
              return { ...prevMachine, weight: null };
            }
            return { ...prevMachine, weight: weight };
          } else if (action === "toggle") {
            const toggleBoolean = prevMachine.toggle;
            if (toggleBoolean) {
              const weight = prevMachine.weight;
              if (!weight) {
                return {
                  ...prevMachine,
                  toggle: !toggleBoolean,
                  weight: null,
                };
              }

              return {
                ...prevMachine,
                toggle: !toggleBoolean,
                funds: Math.ceil(weight / coinWeight),
              };
            } else {
              const coins = prevMachine.funds;
              const weight = prevMachine.weight;
              if (!coins) {
                return {
                  ...prevMachine,
                  toggle: !toggleBoolean,
                  funds: null,
                  weight: null,
                };
              }
              return {
                ...prevMachine,
                toggle: !toggleBoolean,
                weight,
              };
            }
          }
        }
        return prevMachine;
      });
    });
  };

  return (
    <Stack gap={4} w="full">
      {machinesAndFunds.map((machineAndFunds) => {
        return (
          <Box
            key={machineAndFunds.machine.name}
            p={5}
            bg="white"
            borderWidth="2px"
            borderColor="gray.200"
            borderRadius="xl"
            shadow="sm"
            transition="all 0.2s"
            _hover={{
              borderColor: "blue.300",
              shadow: "md",
              transform: "translateY(-2px)",
            }}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {machineAndFunds.machine.name}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {machineAndFunds.toggle ? "質量から計算" : "枚数を入力"}
                </Text>
              </Box>
              <Button
                borderRadius="full"
                variant="outline"
                size="md"
                p={3}
                minW="auto"
                h="auto"
                borderWidth="2px"
                borderColor="gray.300"
                color="blue.600"
                bg="white"
                onClick={(e) =>
                  hander(machineAndFunds.machine.name, "toggle", e)
                }
                _active={{
                  borderColor: "blue.400",
                  bg: "blue.50",
                  transform: "rotate(180deg)",
                }}
                transition="all 0.3s"
              >
                <FaArrowsRotate size={18} />
              </Button>
            </Flex>

            {machineAndFunds.toggle ? (
              <NumberInput.Root
                min={0}
                w="full"
                value={machineAndFunds.weight ? machineAndFunds.weight : ""}
                onValueChange={(e) =>
                  hander(machineAndFunds.machine.name, "inputWeight", e)
                }
              >
                <NumberInput.Control />
                <InputGroup
                  startAddon={
                    <Box
                      px={4}
                      fontWeight="semibold"
                      color="gray.600"
                      bg="gray.100"
                    >
                      g
                    </Box>
                  }
                >
                  <NumberInput.Input
                    placeholder="100円玉の質量を入力"
                    size="lg"
                    fontSize="16px"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
                      outline: "none",
                    }}
                    _hover={{
                      borderColor: "gray.400",
                    }}
                  />
                </InputGroup>
              </NumberInput.Root>
            ) : (
              <NumberInput.Root
                min={0}
                w="full"
                value={machineAndFunds.funds ? machineAndFunds.funds : ""}
                onValueChange={(e) =>
                  hander(machineAndFunds.machine.name, "inputCoin", e)
                }
              >
                <NumberInput.Control />
                <InputGroup
                  startAddon={
                    <Box fontWeight="semibold" color="gray.600" bg="gray.100">
                      枚
                    </Box>
                  }
                >
                  <NumberInput.Input
                    placeholder="100円玉の枚数を入力"
                    size="lg"
                    fontSize="16px"
                    borderWidth="2px"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.15)",
                      outline: "none",
                    }}
                    _hover={{
                      borderColor: "gray.400",
                    }}
                  />
                </InputGroup>
              </NumberInput.Root>
            )}

            {machineAndFunds.funds && (
              <Box mt={3} p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.700" fontWeight="semibold">
                  合計: ¥{(machineAndFunds.funds * 100).toLocaleString()}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default MachineAndMoney;
