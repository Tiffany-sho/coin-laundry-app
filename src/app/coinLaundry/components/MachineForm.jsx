"use client";

import { Button, Card, Field, Box, Stack, Text } from "@chakra-ui/react";

const MachineForm = ({ machines, setMachines, setChoose }) => {
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
        <Card.Header>
          <Card.Title>設備を選択してください</Card.Title>
          <Card.Description>
            Fill in the form below to create an account
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack gap="4" w="full">
            {machines.map((machine) => {
              return (
                <Field.Root
                  key={machine.name}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Field.Label>{machine.name}</Field.Label>
                  <Box>
                    <Button
                      onClick={() => handleCountChange(machine.name, -1)}
                      size="2xs"
                      borderRadius="full"
                    >
                      <Text fontSize="xs" fontWeight="bold">
                        -
                      </Text>
                    </Button>
                    <Text fontSize="xl" display="inline" mx="0.6em">
                      {machine.num}
                    </Text>

                    <Button
                      onClick={() => handleCountChange(machine.name, 1)}
                      size="2xs"
                      borderRadius="full"
                    >
                      <Text fontSize="xs" fontWeight="bold">
                        +
                      </Text>
                    </Button>
                  </Box>
                </Field.Root>
              );
            })}
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
          <Button variant="solid" onClick={() => setChoose((prev) => !prev)}>
            完了
          </Button>
        </Card.Footer>
      </Card.Root>
    </>
  );
};

export default MachineForm;
