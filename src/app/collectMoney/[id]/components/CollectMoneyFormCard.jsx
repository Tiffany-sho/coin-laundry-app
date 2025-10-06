"use client";

import { useEffect, useState } from "react";

import { Button, Card, Field, Input, Stack } from "@chakra-ui/react";

const CollectMoneyFormCard = ({ machines, store }) => {
  const [machinesAndMoney, setMachinesAndMoney] = useState(() => {
    console.log("useStateの初期化処理は1回だけ実行されます");
    const initialValue = machines.map((machine) => ({
      machine,
      money: null,
    }));
    return initialValue;
  });

  console.log(machinesAndMoney);

  return (
    <Card.Root maxW="sm">
      <Card.Header>
        <Card.Title>{store}店</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack gap="4" w="full">
          {machinesAndMoney.map((machineAndMoney) => {
            return (
              <Field.Root key={machineAndMoney.machine._id}>
                <Field.Label>{machineAndMoney.machine.name}</Field.Label>
                <Input />
              </Field.Root>
            );
          })}
        </Stack>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Button variant="outline">Cancel</Button>
        <Button variant="solid">Sign in</Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default CollectMoneyFormCard;
