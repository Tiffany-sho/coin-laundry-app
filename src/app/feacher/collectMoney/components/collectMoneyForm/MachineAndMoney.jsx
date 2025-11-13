"use client";

import {
  Button,
  Field,
  HStack,
  InputGroup,
  NumberInput,
  Stack,
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
            if (coins === "") {
              return { ...prevMachine, funds: null };
            }
            return { ...prevMachine, funds: coins };
          } else if (action === "inputWeight") {
            const weight = parseInt(event.value);
            if (weight === "") {
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
    <Stack gap={5} w="full">
      {machinesAndFunds.map((machineAndFunds) => {
        return (
          <Field.Root
            key={machineAndFunds.machine.name}
            p={4}
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
          >
            <Field.Label
              fontSize="md"
              fontWeight="semibold"
              color="gray.700"
              mb={3}
            >
              {machineAndFunds.machine.name}
            </Field.Label>
            <HStack gap={3}>
              {machineAndFunds.toggle ? (
                <NumberInput.Root
                  min={0}
                  maxW="250px"
                  value={machineAndFunds.weight ? machineAndFunds.weight : ""}
                  onValueChange={(e) =>
                    hander(machineAndFunds.machine.name, "inputWeight", e)
                  }
                >
                  <NumberInput.Control />
                  <InputGroup startAddon="g">
                    <NumberInput.Input
                      placeholder="100円玉の質量"
                      size="lg"
                      fontSize="16px"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        outline: "none",
                      }}
                    />
                  </InputGroup>
                </NumberInput.Root>
              ) : (
                <NumberInput.Root
                  min={0}
                  maxW="250px"
                  value={machineAndFunds.funds ? machineAndFunds.funds : ""}
                  onValueChange={(e) =>
                    hander(machineAndFunds.machine.name, "inputCoin", e)
                  }
                >
                  <NumberInput.Control />
                  <InputGroup startAddon="枚">
                    <NumberInput.Input
                      placeholder="100円玉の枚数"
                      size="lg"
                      fontSize="16px"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        outline: "none",
                      }}
                    />
                  </InputGroup>
                </NumberInput.Root>
              )}
              <Button
                borderRadius="full"
                variant="outline"
                size="lg"
                p={3}
                minW="auto"
                borderColor="gray.300"
                color="gray.600"
                onClick={(e) =>
                  hander(machineAndFunds.machine.name, "toggle", e)
                }
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  outline: "none",
                }}
              >
                <FaArrowsRotate size={18} />
              </Button>
            </HStack>
          </Field.Root>
        );
      })}
    </Stack>
  );
};

export default MachineAndMoney;
