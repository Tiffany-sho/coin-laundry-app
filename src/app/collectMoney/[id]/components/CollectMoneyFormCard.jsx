"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Field,
  HStack,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";

import { FaArrowsRotate } from "react-icons/fa6";

const coinWeight = 4.8;

const CollectMoneyFormCard = ({ machines, store }) => {
  const [msg, setMsg] = useState("");
  const [res, resSet] = useState(false);
  const [machinesAndMoney, setMachinesAndMoney] = useState(() => {
    const initialValue = machines.map((machine) => ({
      machine,
      money: null,
      weight: null,
      toggle: false,
    }));
    return initialValue;
  });

  const hander = (machineId, action, event) => {
    setMachinesAndMoney((prevMachines) => {
      return prevMachines.map((prevMachine) => {
        if (prevMachine.machine._id === machineId) {
          if (action === "inputCoin") {
            const coins = event.target.value;
            if (coins === "") {
              return { ...prevMachine, money: null };
            }
            const newCoin = coins.replace(/[^0-9.]/g, "");
            return { ...prevMachine, money: newCoin };
          } else if (action === "inputWeight") {
            const weight = event.target.value;
            if (weight === "") {
              return { ...prevMachine, weight: null };
            }
            const newWeight = weight.replace(/[^0-9.]/g, "");
            return { ...prevMachine, weight: newWeight };
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
                money: Math.ceil(weight / coinWeight),
              };
            } else {
              const coins = prevMachine.money;
              if (!coins) {
                return {
                  ...prevMachine,
                  toggle: !toggleBoolean,
                  money: null,
                  weight: null,
                };
              }
              return {
                ...prevMachine,
                toggle: !toggleBoolean,
              };
            }
          }
        }
        return prevMachine;
      });
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const PostArray = machinesAndMoney.map((machineAndMoney) => {
      if (!machineAndMoney.money && machineAndMoney.weight) {
        return {
          machine: machineAndMoney.machine,
          money: Math.ceil(machineAndMoney.weight / coinWeight),
        };
      }
      return {
        machine: machineAndMoney.machine,
        money: machineAndMoney.money,
      };
    });

    const data = {
      store,
      date: Date.now(),
      moneyArray: PostArray,
    };
    const JsonData = JSON.stringify(data);
    fetch("/api/collectMoney", { method: "POST", body: JsonData })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((res) => {
            resSet(false);
            return res.msg;
          });
        }
        return res.json().then((res) => {
          resSet(true);
          return `${res.store}の集金データを登録できました。`;
        });
      })
      .then((msg) => {
        setMsg(msg);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card.Root maxW="sm">
        <Card.Header>
          <Card.Title>{store}店</Card.Title>
        </Card.Header>
        <Card.Body>
          <Stack gap="8" w="full">
            {machinesAndMoney.map((machineAndMoney) => {
              return (
                <Field.Root key={machineAndMoney.machine._id}>
                  <Field.Label>{machineAndMoney.machine.name}</Field.Label>
                  <HStack>
                    {machineAndMoney.toggle ? (
                      <InputGroup endAddon="ｇ">
                        <Input
                          value={
                            machineAndMoney.weight !== null
                              ? machineAndMoney.weight
                              : ""
                          }
                          onChange={(e) =>
                            hander(
                              machineAndMoney.machine._id,
                              "inputWeight",
                              e
                            )
                          }
                          placeholder="100円玉の質量"
                        />
                      </InputGroup>
                    ) : (
                      <InputGroup endAddon="枚">
                        <Input
                          value={
                            machineAndMoney.money !== null
                              ? machineAndMoney.money
                              : ""
                          }
                          onChange={(e) =>
                            hander(machineAndMoney.machine._id, "inputCoin", e)
                          }
                          placeholder="100円玉の枚数"
                        />
                      </InputGroup>
                    )}
                    <Button
                      borderRadius="full"
                      variant="outline"
                      onClick={(e) =>
                        hander(machineAndMoney.machine._id, "toggle", e)
                      }
                    >
                      <FaArrowsRotate />
                    </Button>
                  </HStack>
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
          <div style={{ color: res ? "green" : "red" }}>{msg}</div>
        </Card.Footer>
      </Card.Root>
    </form>
  );
};

export default CollectMoneyFormCard;
