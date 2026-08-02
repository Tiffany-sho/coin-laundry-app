"use client";

import { useState } from "react";

import {
  Button,
  HStack,
  Input,
  InputGroup,
  NumberInput,
  Stack,
  Box,
  Text,
  Flex,
} from "@chakra-ui/react";

import * as Icon from "@/app/feacher/Icon";
import { LuRefreshCw } from "@/app/feacher/Icon";

const coinWeight = 4.8;

/**
 * 機種別入力。設備ごとの硬貨の枚数（または質量）を受け取る。
 *
 * ⚠️ **`methods` を渡すと、設備ごとにキャッシュレスの内訳も入力できる**（2026-08-02 に追加）。
 *    サーバは前からこの形を受け付けていた（`normalizeFundsArray` の `hasMachineCashless`）が、
 *    Web には入力欄が無く**アプリからしか記録できなかった。**
 *
 * ⚠️ **設備ごとに入力したら、集金レベルのキャッシュレス欄は出さないこと。**
 *    両方に入れられると同じ金額を 2 か所に書けてしまい、サーバは
 *    設備の側を正とするので**集金レベルに入れた分が黙って消える。**
 *    出し分けは `CollectMoneyForm` が持っている。
 */
const MachineAndMoney = ({ machinesAndFunds, setMachinesAndFunds, methods = [] }) => {
  /** どの設備のキャッシュレス欄を開いているか（設備名） */
  const [openCashless, setOpenCashless] = useState([]);

  const toggleCashless = (name) =>
    setOpenCashless((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const changeCashless = (machineName, methodId, value) => {
    setMachinesAndFunds((prev) =>
      prev.map((row) =>
        row.machine.name === machineName
          ? { ...row, cashless: { ...(row.cashless ?? {}), [methodId]: value } }
          : row
      )
    );
  };

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
                return { ...prevMachine, toggle: !toggleBoolean, weight: null };
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
                return { ...prevMachine, toggle: !toggleBoolean, funds: null, weight: null };
              }
              return { ...prevMachine, toggle: !toggleBoolean, weight };
            }
          }
        }
        return prevMachine;
      });
    });
  };

  return (
    <Stack gap={5} w="full">
      {machinesAndFunds.map((machineAndFunds, index) => (
        <Box key={machineAndFunds.machine.name}>
          {index > 0 && <Box h="1px" bg="var(--divider, #F1F5F9)" mb={5} />}

          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="var(--text-main, #1E3A5F)">
                {machineAndFunds.machine.name}
              </Text>
              <Text fontSize="xs" color="var(--text-muted, #64748B)" mt={0.5}>
                {machineAndFunds.toggle ? "質量から計算" : "枚数を入力"}
              </Text>
            </Box>
            <Button
              borderRadius="full"
              variant="outline"
              size="sm"
              p={2}
              minW="auto"
              h="auto"
              borderWidth="1.5px"
              borderColor="cyan.200"
              color="var(--teal, #0891B2)"
              bg="var(--card-bg, #FFFFFF)"
              onClick={(e) => hander(machineAndFunds.machine.name, "toggle", e)}
              _active={{ borderColor: "cyan.400", bg: "cyan.50", transform: "rotate(180deg)" }}
              transition="all 0.3s"
            >
              <LuRefreshCw size={16} />
            </Button>
          </Flex>

          {machineAndFunds.toggle ? (
            <NumberInput.Root
              min={0}
              w="full"
              borderRadius="md"
              value={machineAndFunds.weight ? machineAndFunds.weight : ""}
              onValueChange={(e) => hander(machineAndFunds.machine.name, "inputWeight", e)}
            >
              <NumberInput.Control />
              <InputGroup
                startAddon={
                  <Box px={4} fontWeight="semibold" color="var(--teal-deeper, #155E75)" bg="cyan.100">
                    g
                  </Box>
                }
              >
                <NumberInput.Input
                  placeholder="100円玉の質量を入力"
                  size="lg"
                  fontSize="16px"
                  bg="white"
                  borderWidth="1.5px"
                  borderColor="cyan.200"
                  _focus={{
                    borderColor: "var(--teal, #0891B2)",
                    boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.15)",
                    outline: "none",
                  }}
                  _hover={{ borderColor: "cyan.400" }}
                />
              </InputGroup>
            </NumberInput.Root>
          ) : (
            <NumberInput.Root
              min={0}
              w="full"
              borderRadius="md"
              value={machineAndFunds.funds ? machineAndFunds.funds : ""}
              onValueChange={(e) => hander(machineAndFunds.machine.name, "inputCoin", e)}
            >
              <NumberInput.Control />
              <InputGroup
                startAddon={
                  <Box fontWeight="semibold" color="var(--teal-deeper, #155E75)" bg="cyan.100">
                    枚
                  </Box>
                }
              >
                <NumberInput.Input
                  placeholder="100円玉の枚数を入力"
                  size="lg"
                  fontSize="16px"
                  bg="white"
                  borderWidth="1.5px"
                  borderColor="cyan.200"
                  _focus={{
                    borderColor: "var(--teal, #0891B2)",
                    boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.15)",
                    outline: "none",
                  }}
                  _hover={{ borderColor: "cyan.400" }}
                />
              </InputGroup>
            </NumberInput.Root>
          )}

          {/*
            設備ごとのキャッシュレス。
            ⚠️ **既定では畳んでおく。** 設備の数 × 支払方法の数だけ欄が並ぶので、
               開きっぱなしだと現金の入力欄が画面から押し出される。
            ⚠️ 単位は「円」。すぐ上の欄は硬貨の**枚数**なので取り違えないこと。
          */}
          {methods.length > 0 &&
            (() => {
              const values = machineAndFunds.cashless ?? {};
              const sum = methods.reduce(
                (acc, m) => acc + (Number(values[m.id]) || 0),
                0
              );
              const open = openCashless.includes(machineAndFunds.machine.name);
              return (
                <Box mt={3}>
                  <Button
                    onClick={() => toggleCashless(machineAndFunds.machine.name)}
                    variant="ghost"
                    size="sm"
                    px={2}
                    color="var(--teal, #0891B2)"
                    fontWeight="semibold"
                  >
                    <HStack gap={2}>
                      <Icon.LuCreditCard size={15} />
                      <Text fontSize="sm">
                        キャッシュレス
                        {sum > 0 ? `　¥${sum.toLocaleString()}` : ""}
                      </Text>
                      {open ? <Icon.LuChevronUp size={15} /> : <Icon.LuChevronDown size={15} />}
                    </HStack>
                  </Button>

                  {open && (
                    <Stack gap={2} mt={2} pl={2}>
                      {methods.map((method) => (
                        <HStack key={method.id} gap={3}>
                          <Text fontSize="sm" color="var(--text-main)" flex="1" minW={0} truncate>
                            {method.name}
                          </Text>
                          <HStack gap={1} flexShrink={0}>
                            <Text fontSize="sm" color="var(--text-muted)">
                              ¥
                            </Text>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              value={values[method.id] ?? ""}
                              onChange={(e) =>
                                changeCashless(
                                  machineAndFunds.machine.name,
                                  method.id,
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              w={{ base: "110px", md: "140px" }}
                              h="44px"
                              textAlign="right"
                              bg="white"
                              borderRadius="lg"
                              /* ⚠️ 16px 未満にしない。iOS Safari が入力時に拡大する */
                              fontSize="16px"
                              fontFamily="'Space Mono', monospace"
                              _focusVisible={{ borderColor: "cyan.400" }}
                            />
                          </HStack>
                        </HStack>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })()}

          {/* ⚠️ 現金とキャッシュレスを足した「その設備の合計」を出す。
                 現金だけ出すと、キャッシュレスを入れたのに数字が動かないように見える */}
          {(() => {
            const cash = (Number(machineAndFunds.funds) || 0) * 100;
            const cashlessSum = methods.reduce(
              (acc, m) => acc + (Number((machineAndFunds.cashless ?? {})[m.id]) || 0),
              0
            );
            if (cash + cashlessSum === 0) return null;
            return (
              <Box mt={2} px={3} py={2} bg="var(--teal-pale, #CFFAFE)" borderRadius="md">
                <Text fontSize="sm" color="var(--teal-deeper, #155E75)" fontWeight="semibold">
                  合計: ¥{(cash + cashlessSum).toLocaleString()}
                  {cashlessSum > 0 && (
                    <Text as="span" fontWeight="normal" fontSize="xs">
                      　（現金 ¥{cash.toLocaleString()}）
                    </Text>
                  )}
                </Text>
              </Box>
            );
          })()}
        </Box>
      ))}
    </Stack>
  );
};

export default MachineAndMoney;
