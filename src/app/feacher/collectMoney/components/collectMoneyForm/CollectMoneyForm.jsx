"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Box,
  Button,
  Card,
  Field,
  HStack,
  InputGroup,
  NumberInput,
  Spinner,
  Stack,
} from "@chakra-ui/react";

import { FaArrowsRotate } from "react-icons/fa6";
import EpochTimeSelector from "./selectDate/SelectDate";
import { createData } from "@/app/collectMoney/action";

const coinWeight = 4.8;
const CollectMoneyForm = ({ coinLaundry }) => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [epoc, setEpoc] = useState(null);

  const [machinesAndMoney, setMachinesAndMoney] = useState(() => {
    const initialValue = coinLaundry.machines.map((machine) => ({
      machine,
      money: null,
      weight: null,
      toggle: false,
    }));
    return initialValue;
  });

  const hander = (machine, action, event) => {
    setMachinesAndMoney((prevMachines) => {
      return prevMachines.map((prevMachine) => {
        if (prevMachine.machine.name === machine) {
          if (action === "inputCoin") {
            const coins = parseInt(event.value);
            if (coins === "") {
              return { ...prevMachine, money: null };
            }
            return { ...prevMachine, money: coins };
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
    setIsLoading(true);
    setMsg("");
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

    const date = epoc ? epoc : Date.now();

    const formData = {
      store: coinLaundry.store,
      storeId: coinLaundry.id,
      date,
      moneyArray: postArray,
    };

    let responseData;
    try {
      const { data, error } = await createData(formData);

      responseData = data;
      if (error) {
        throw new Error(error.message || "データの作成に失敗しました");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMsg("API Error:", error);
    }

    console.log(responseData);
    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${responseData.storeName}店の集金データの登録が完了しました。`,
        type: "success",
        closable: true,
      })
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    redirect(`/coinLaundry/${responseData.storeId}/coinDataList`);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      py={8}
      px={4}
    >
      <form onSubmit={onSubmit}>
        <Card.Root maxW="2xl" w="full" boxShadow="lg" borderRadius="lg">
          <Card.Header
            bg="gray.600"
            color="white"
            py={5}
            px={6}
            borderTopRadius="lg"
          >
            <Card.Title fontSize="xl" fontWeight="bold">
              {coinLaundry.store}店
            </Card.Title>
          </Card.Header>

          <Card.Body py={6} px={6}>
            <Stack gap={6} w="full">
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <EpochTimeSelector setEpoc={setEpoc} />
              </Box>

              <Stack gap={5} w="full">
                {machinesAndMoney.map((machineAndMoney) => {
                  return (
                    <Field.Root
                      key={machineAndMoney.machine.name}
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
                        {machineAndMoney.machine.name}
                      </Field.Label>
                      <HStack gap={3}>
                        {machineAndMoney.toggle ? (
                          <NumberInput.Root
                            min={0}
                            maxW="250px"
                            value={
                              machineAndMoney.weight
                                ? machineAndMoney.weight
                                : ""
                            }
                            onValueChange={(e) =>
                              hander(
                                machineAndMoney.machine.name,
                                "inputWeight",
                                e
                              )
                            }
                          >
                            <NumberInput.Control />
                            <InputGroup startAddon="g">
                              <NumberInput.Input
                                placeholder="100円玉の質量"
                                size="lg"
                                borderColor="gray.300"
                                disabled={isLoading}
                                _focus={{
                                  borderColor: "blue.500",
                                  boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
                                  outline: "none",
                                }}
                              />
                            </InputGroup>
                          </NumberInput.Root>
                        ) : (
                          <NumberInput.Root
                            min={0}
                            maxW="250px"
                            value={
                              machineAndMoney.money !== null
                                ? machineAndMoney.money
                                : ""
                            }
                            onValueChange={(e) =>
                              hander(
                                machineAndMoney.machine.name,
                                "inputCoin",
                                e
                              )
                            }
                          >
                            <NumberInput.Control />
                            <InputGroup startAddon="枚">
                              <NumberInput.Input
                                placeholder="100円玉の枚数"
                                size="lg"
                                disabled={isLoading}
                                borderColor="gray.300"
                                _focus={{
                                  borderColor: "blue.500",
                                  boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
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
                          disabled={isLoading}
                          borderColor="gray.300"
                          color="gray.600"
                          onClick={(e) =>
                            hander(machineAndMoney.machine.name, "toggle", e)
                          }
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-blue-500)",
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
            </Stack>
          </Card.Body>

          <Card.Footer
            justifyContent="flex-end"
            gap={3}
            px={6}
            pb={6}
            pt={4}
            borderTop="1px"
            borderColor="gray.200"
          >
            <Link href={"/collectMoney"}>
              <Button
                variant="outline"
                size="lg"
                colorScheme="gray"
                fontWeight="medium"
                disabled={isLoading}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  outline: "none",
                }}
              >
                キャンセル
              </Button>
            </Link>
            <Button
              variant="solid"
              colorScheme="blue"
              size="lg"
              type="submit"
              fontWeight="semibold"
              disabled={isLoading}
              _focus={{
                boxShadow: "0 0 0 3px var(--chakra-colors-blue-200)",
                outline: "none",
              }}
            >
              {isLoading && <Spinner />} 登録
            </Button>
          </Card.Footer>

          {msg && (
            <Box px={6} pb={6}>
              <Text
                color="red.600"
                fontSize="sm"
                fontWeight="medium"
                p={3}
                bg="red.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="red.200"
              >
                {msg}
              </Text>
            </Box>
          )}
        </Card.Root>
      </form>
    </Box>
  );
};

export default CollectMoneyForm;
