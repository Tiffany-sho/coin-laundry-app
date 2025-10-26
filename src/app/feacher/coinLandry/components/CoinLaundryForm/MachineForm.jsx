"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Flex,
  Stack,
  Text,
  HStack,
  IconButton,
  NumberInput,
} from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import PropoverForm from "./PropoverForm";

const MachineForm = ({ machines, setMachines, setChoose, setOpen, open }) => {
  useEffect(() => {
    if (!open) {
      setChoose(null);
    }
  }, [open]);

  const handleCountChange = (machineName, amount) => {
    setMachines((prevMachines) => {
      return prevMachines.map((machine) => {
        if (machine.name === machineName) {
          const newNum = Math.max(0, machine.num + amount);
          return { ...machine, num: newNum };
        }
        return machine;
      });
    });
  };

  return (
    <>
      <Card.Root maxW="sm">
        <Flex justifyContent="space-between">
          <Card.Description m="5%">
            機械の削除は個数を0にすると自動的に削除されます
          </Card.Description>
          <PropoverForm setMachines={setMachines} />
        </Flex>

        <Card.Body>
          <Stack gap="4" w="full">
            {machines.map((machine) => {
              return (
                <Flex key={machine.name} justifyContent="space-between">
                  <Text>{machine.name}</Text>
                  <NumberInput.Root
                    unstyled
                    spinOnPress={false}
                    key={machine.name}
                  >
                    <HStack gap="2">
                      {machine.num !== 0 && (
                        <NumberInput.DecrementTrigger asChild>
                          <IconButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleCountChange(machine.name, -1)}
                          >
                            <LuMinus />
                          </IconButton>
                        </NumberInput.DecrementTrigger>
                      )}

                      <NumberInput.ValueText
                        textAlign="center"
                        fontSize="lg"
                        minW="3ch"
                      >
                        {machine.num === 0 ? "0" : machine.num}
                      </NumberInput.ValueText>
                      <NumberInput.IncrementTrigger asChild>
                        <IconButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleCountChange(machine.name, 1)}
                        >
                          <LuPlus />
                        </IconButton>
                      </NumberInput.IncrementTrigger>
                    </HStack>
                  </NumberInput.Root>
                </Flex>
              );
            })}
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
          <Button variant="solid" onClick={() => setOpen(false)} w="100%">
            完了
          </Button>
        </Card.Footer>
      </Card.Root>
    </>
  );
};

export default MachineForm;
