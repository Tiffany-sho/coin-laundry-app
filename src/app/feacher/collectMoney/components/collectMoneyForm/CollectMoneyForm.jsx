"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Button,
  Card,
  Field,
  HStack,
  InputGroup,
  NumberInput,
  Stack,
} from "@chakra-ui/react";

import { FaArrowsRotate } from "react-icons/fa6";

const coinWeight = 4.8;
// { machines, id, store }
const CollectMoneyForm = ({ coinLaundry }) => {
  const [msg, setMsg] = useState("");
  const [res, resSet] = useState(false);

  const [machinesAndMoney, setMachinesAndMoney] = useState(() => {
    const initialValue = coinLaundry.machines.map((machine) => ({
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
            const coins = parseInt(event.value);
            if (coins === "") {
              return { ...prevMachine, money: null };
            }
            return { ...prevMachine, money: coins };
          } else if (action === "inputWeight") {
            const weight = parseInt(event.value);
            console.log(weight);
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
                money: Math.ceil(weight / coinWeight),
              };
            } else {
              const coins = prevMachine.money;
              const weight = prevMachine.weight;
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
                weight,
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

    const postArray = machinesAndMoney.map((machineAndMoney) => {
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
      store: coinLaundry.store,
      storeId: coinLaundry._id,
      date: Date.now(),
      moneyArray: postArray,
    };
    const JsonData = JSON.stringify(data);
    fetch(`/api/coinLaundry/${coinLaundry._id}/collectMoney`, {
      method: "POST",
      body: JsonData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((res) => {
            resSet(false);
            return res.msg;
          });
        }
        return res.json().then((res) => {
          sessionStorage.setItem(
            "toast",
            JSON.stringify({
              description: `${res.store}店の集金データの登録が完了しました。`,
              type: "success",
              closable: true,
            })
          );
          redirect(`/collectMoney`);
        });
      })
      .then((msg) => {
        setMsg(msg);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Card.Root maxW="sm">
        <Card.Header textStyle="xl">{coinLaundry.store}店</Card.Header>
        <Card.Body>
          <Stack gap="8" w="full">
            {machinesAndMoney.map((machineAndMoney) => {
              return (
                <Field.Root key={machineAndMoney.machine._id}>
                  <Field.Label>{machineAndMoney.machine.name}</Field.Label>
                  <HStack>
                    {machineAndMoney.toggle ? (
                      <NumberInput.Root
                        min={0}
                        maxW="200px"
                        value={
                          machineAndMoney.weight ? machineAndMoney.weight : ""
                        }
                        onValueChange={(e) =>
                          hander(machineAndMoney.machine._id, "inputWeight", e)
                        }
                      >
                        <NumberInput.Control />
                        <InputGroup startAddon="g">
                          <NumberInput.Input placeholder="100円玉の質量" />
                        </InputGroup>
                      </NumberInput.Root>
                    ) : (
                      <NumberInput.Root
                        min={0}
                        maxW="200px"
                        value={
                          machineAndMoney.money !== null
                            ? machineAndMoney.money
                            : ""
                        }
                        onValueChange={(e) =>
                          hander(machineAndMoney.machine._id, "inputCoin", e)
                        }
                      >
                        <NumberInput.Control />
                        <InputGroup startAddon="枚">
                          <NumberInput.Input placeholder="100円玉の枚数" />
                        </InputGroup>
                      </NumberInput.Root>
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
          <Link href={"/collectMoney"}>
            <Button variant="outline">キャンセル</Button>
          </Link>
          <Button variant="solid" type="submit">
            登録
          </Button>
          <div style={{ color: res ? "green" : "red" }}>{msg}</div>
        </Card.Footer>
      </Card.Root>
    </form>
  );
};

export default CollectMoneyForm;
