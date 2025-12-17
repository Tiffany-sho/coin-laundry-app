"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Switch,
  Text,
  Flex,
  HStack,
  Spinner,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EpochTimeSelector from "../selectDate/SelectDate";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney";

import MachineAndMoney from "./CardContext/MachineAndMoney";
import MoneyTotal from "./CardContext/MoneyTotal";

import * as Icon from "@/app/feacher/Icon";

import FixSwitch from "./parts/FixSwitch";
import { createClient } from "@/utils/supabase/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import ChangeStores from "./parts/ChangeStores";

const CollectMoneyForm = ({ coinLaundry }) => {
  const supabase = createClient();
  const [epoc, setEpoc] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [fixed, setFixed] = useState(null);
  const [moneyTotal, setMoneyTotal] = useState();
  const [machinesAndFunds, setMachinesAndFunds] = useState(() => {
    const initialValue = coinLaundry.machines.map((machine) => ({
      machine,
      funds: null,
      weight: null,
      toggle: false,
    }));
    return initialValue;
  });

  const router = useRouter();

  useEffect(() => {
    const getUserFixed = async () => {
      setLoading(true);
      const { user } = await getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("collectMethod")
        .eq("id", user.id)
        .single();

      if (error) {
        setFixed(null);
      }

      if (data && data.collectMethod !== null) {
        if (data.collectMethod === "total") {
          setChecked(false);
        } else if (data.collectMethod === "machines") {
          setChecked(true);
        } else {
          setChecked(null);
        }
        setFixed(true);
        setLoading(false);
      } else {
        setChecked(false);
        setFixed(false);
        setLoading(false);
      }
    };

    getUserFixed();
  }, []);

  const toggleChangeMethod = (e) => {
    const value = e.checked;
    setChecked(value);

    if (fixed) {
      uploadProfilesMethod(value);
    }
  };

  const toggleChangeFixed = (e) => {
    const isFixed = e.checked;
    setFixed(isFixed);
    if (isFixed) {
      uploadProfilesMethod(checked);
    } else {
      uploadProfilesMethod(null);
    }
  };

  const uploadProfilesMethod = async (method) => {
    const { user } = await getUser();
    if (!user) return;
    const supabase = createClient();

    let collectMethod;
    if (method === null) {
      collectMethod = null;
    } else if (method) {
      collectMethod = "machines";
    } else {
      collectMethod = "total";
    }
    await supabase
      .from("profiles")
      .update({ collectMethod: collectMethod })
      .eq("id", user.id);
  };

  return (
    <VStack spacing={0} minH="100vh" bg="gray.50">
      <Box
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 8 }}
        w="full"
        bg="white"
        position="fixed"
        top="0"
        zIndex="1400"
        borderBottomWidth="1px"
        borderBottomColor="gray.200"
        shadow="sm"
      >
        <HStack justify="space-between" maxW="1200px" mx="auto">
          <Heading
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="gray.800"
          >
            {coinLaundry.store}店
          </Heading>
          <ChangeStores />
        </HStack>
      </Box>

      <Box
        w="full"
        pt={{ base: 20, md: 24 }}
        pb={{ base: 32, md: 36 }}
        px={{ base: 4, md: 8 }}
      >
        <Stack gap={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
          <Card.Root
            bg="white"
            shadow="md"
            borderRadius="2xl"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{
              shadow: "lg",
              transform: "translateY(-2px)",
            }}
          >
            <Card.Body p={{ base: 5, md: 6 }}>
              <HStack mb={4} color="teal.600">
                <Icon.LuCalendar size={22} />
                <Text fontSize="md" fontWeight="semibold">
                  集金日
                </Text>
              </HStack>
              <EpochTimeSelector epoc={epoc} setEpoc={setEpoc} />
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg="white"
            shadow="md"
            borderRadius="2xl"
            overflow="hidden"
          >
            <Card.Body p={{ base: 5, md: 6 }}>
              <Flex
                align="center"
                justify="space-between"
                mb={5}
                gap={4}
                flexWrap={{ base: "wrap", md: "nowrap" }}
              >
                <Box flex="1" minW="200px">
                  <HStack mb={2}>
                    <Icon.RiMoneyCnyCircleLine size={22} color="teal.600" />
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                      {checked ? "機種別集金" : "まとめて集金"}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {checked
                      ? "各機種ごとに金額を入力します"
                      : "合計金額のみを入力します"}
                  </Text>
                </Box>
                {loading ? (
                  <Spinner size="lg" color="blue.500" thickness="3px" />
                ) : (
                  <Switch.Root
                    checked={checked}
                    onCheckedChange={toggleChangeMethod}
                    size="lg"
                  >
                    <Switch.HiddenInput />
                    <Switch.Control
                      bg={checked ? "blue.500" : "gray.300"}
                      _hover={{
                        bg: checked ? "blue.600" : "gray.400",
                      }}
                      transition="all 0.2s"
                    >
                      <Switch.Thumb bg="white" shadow="md" />
                    </Switch.Control>
                  </Switch.Root>
                )}
              </Flex>

              <Box pt={5} mt={5} borderTop="1px" borderColor="gray.200">
                <FixSwitch
                  toggleChangeFixed={toggleChangeFixed}
                  fixed={fixed}
                />
              </Box>
            </Card.Body>
          </Card.Root>

          <Box>
            {checked ? (
              <MachineAndMoney
                machinesAndFunds={machinesAndFunds}
                setMachinesAndFunds={setMachinesAndFunds}
              />
            ) : (
              <Card.Root
                bg="white"
                shadow="md"
                borderRadius="2xl"
                overflow="hidden"
              >
                <Card.Body p={{ base: 5, md: 6 }}>
                  <HStack mb={4} color="teal.600">
                    <Icon.RiMoneyCnyCircleLine size={22} />
                    <Text fontSize="md" fontWeight="semibold">
                      合計金額
                    </Text>
                  </HStack>
                  <MoneyTotal
                    moneyTotal={moneyTotal}
                    setMoneyTotal={setMoneyTotal}
                  />
                </Card.Body>
              </Card.Root>
            )}
          </Box>

          {/* エラーメッセージ */}
          {msg && (
            <Card.Root
              bg="red.50"
              borderColor="red.300"
              borderWidth="1px"
              shadow="sm"
              borderRadius="xl"
            >
              <Card.Body p={4}>
                <HStack>
                  <Icon.LiaStoreSolid size={20} color="red.600" />
                  <Text color="red.700" fontSize="sm" fontWeight="medium">
                    {msg}
                  </Text>
                </HStack>
              </Card.Body>
            </Card.Root>
          )}
        </Stack>
      </Box>

      {/* フッター（固定） */}
      <HStack
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 8 }}
        w="full"
        bg="white"
        position="fixed"
        bottom="0"
        zIndex="1400"
        borderTopWidth="1px"
        borderTopColor="gray.200"
        shadow="lg"
        gap={{ base: 3, md: 4 }}
        justify="space-between"
        flexWrap={{ base: "wrap", sm: "nowrap" }}
      >
        <Box minW={{ base: "full", sm: "150px" }}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
            合計収益額
          </Text>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="blue.500"
          >
            ¥
            {(
              machinesAndFunds.reduce(
                (acc, item) => acc + (item.funds || 0),
                0
              ) * 100
            ).toLocaleString()}
          </Text>
        </Box>

        <HStack gap={3} w={{ base: "full", sm: "auto" }}>
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            bg="white"
            color="gray.700"
            fontWeight="semibold"
            px={{ base: 6, md: 8 }}
            borderWidth="2px"
            borderColor="gray.300"
            borderRadius="xl"
            flex={{ base: 1, sm: "unset" }}
            _hover={{
              bg: "gray.50",
              borderColor: "gray.400",
              transform: "translateY(-1px)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
          >
            キャンセル
          </Button>

          <Box flex={{ base: 1, sm: "unset" }}>
            <CheckDialog
              coinLaundry={coinLaundry}
              checked={checked}
              machinesAndFunds={machinesAndFunds}
              moneyTotal={moneyTotal}
              epoc={epoc}
              setMsg={setMsg}
            />
          </Box>
        </HStack>
      </HStack>
    </VStack>
  );
};

export default CollectMoneyForm;
