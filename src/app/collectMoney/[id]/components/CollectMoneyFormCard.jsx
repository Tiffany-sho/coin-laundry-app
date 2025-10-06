"use client";

import { useState } from "react";

import { Button, Card, Field, Input, Stack } from "@chakra-ui/react";

const CollectMoneyFormCard = ({ machines, store }) => {
  const [machinesAndMoney, setMachinesAndMoney] = useState(() => {
    const initialValue = machines.map((machine) => ({
      machine,
      money: null,
    }));
    return initialValue;
  });

  const hander = (machineId, event) => {
    const value = event.target.value;
    setMachinesAndMoney((prevMachines) => {
      return prevMachines.map((prevMachine) => {
        if (prevMachine.machine._id === machineId) {
          if (value === "") {
            return { ...prevMachine, money: null };
          }
          const newValue = value.replace(/[^0-9]/g, "");
          return { ...prevMachine, money: newValue };
        }
        return prevMachine;
      });
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const data = {
      store,
      date: Date.now(),
      moneyArray: machinesAndMoney,
    };
    const JsonData = JSON.stringify(data);
    fetch("/api/collectMoney", { method: "POST", body: JsonData });
  };

  return (
    <form onSubmit={onSubmit}>
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
                  <Input
                    value={
                      machineAndMoney.money !== null
                        ? machineAndMoney.money
                        : ""
                    }
                    onChange={(e) => hander(machineAndMoney.machine._id, e)}
                    placeholder="100円玉の枚数"
                  />
                </Field.Root>
              );
            })}
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
          <Button variant="outline">キャンセル</Button>
          <Button variant="solid" type="submit">
            登録
          </Button>
        </Card.Footer>
      </Card.Root>
    </form>
  );
};

export default CollectMoneyFormCard;
