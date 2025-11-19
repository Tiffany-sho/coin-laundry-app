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
  Badge,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import Link from "next/link";
import EpochTimeSelector from "../selectDate/SelectDate";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney";

import MachineAndMoney from "./MachineAndMoney";
import MoneyTotal from "./MoneyTotal";

import * as Icon from "@/app/feacher/Icon";

import FixSwitch from "./FixSwitch";
import { createClient } from "@/utils/supabase/client";

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

  useEffect(() => {
    const getUserFixed = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={4}
    >
      <Card.Root
        maxW="3xl"
        w="full"
        boxShadow="2xl"
        borderRadius="2xl"
        overflow="hidden"
        bg="white"
      >
        <Card.Header bg="gray.500" color="white" py={6} px={8}>
          <Flex justify="space-between" align="center">
            <Card.Title fontSize="2xl" fontWeight="bold">
              {coinLaundry.store}店
            </Card.Title>
            <Badge
              bg="teal.400"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="semibold"
              fontSize="sm"
            >
              集金登録
            </Badge>
          </Flex>
        </Card.Header>

        <Card.Body py={8} px={8}>
          <Stack gap={8} w="full">
            {/* 日付選択 */}
            <Box
              p={5}
              bg="gray.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.200"
              shadow="sm"
              transition="all 0.2s"
              _hover={{ borderColor: "teal.400", shadow: "md" }}
            >
              <HStack mb={3} color="gray.600">
                <Icon.LuCalendar size={20} />
                <Text fontSize="sm" fontWeight="semibold">
                  集金日
                </Text>
              </HStack>
              <EpochTimeSelector epoc={epoc} setEpoc={setEpoc} />
            </Box>

            <Box
              p={5}
              bg="gray.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.200"
              shadow="sm"
            >
              <Flex align="center" justify="space-between" mb={4}>
                <Box flex="1">
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {checked ? "機種別集金" : "まとめて集金"}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {checked
                      ? "各機種ごとに金額を入力します"
                      : "合計金額のみを入力します"}
                  </Text>
                </Box>
                {loading ? (
                  <Spinner />
                ) : (
                  <Switch.Root
                    checked={checked}
                    onCheckedChange={toggleChangeMethod}
                    size="lg"
                  >
                    <Switch.HiddenInput />
                    <Switch.Control bg={checked ? "blue.500" : "gray.300"}>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                )}
              </Flex>

              <Box pt={4} borderTop="1px" borderColor="gray.200">
                <FixSwitch
                  toggleChangeFixed={toggleChangeFixed}
                  fixed={fixed}
                />
              </Box>
            </Box>

            <Box>
              {checked ? (
                <MachineAndMoney
                  machinesAndFunds={machinesAndFunds}
                  setMachinesAndFunds={setMachinesAndFunds}
                />
              ) : (
                <Box
                  p={6}
                  bg="gray.50"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  shadow="sm"
                >
                  <HStack mb={4} color="gray.600">
                    <Icon.RiMoneyCnyCircleLine size={20} />
                    <Text fontSize="sm" fontWeight="semibold">
                      合計金額
                    </Text>
                  </HStack>
                  <MoneyTotal
                    moneyTotal={moneyTotal}
                    setMoneyTotal={setMoneyTotal}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </Card.Body>

        <Card.Footer
          justifyContent="flex-end"
          gap={3}
          px={8}
          pb={8}
          pt={6}
          borderTop="1px"
          borderColor="gray.200"
          bg="white"
        >
          <Link href={`/coinLaundry/${coinLaundry.id}`}>
            <Button
              variant="outline"
              size="lg"
              bg="white"
              color="gray.700"
              fontWeight="semibold"
              px={8}
              borderWidth="2px"
              borderColor="gray.300"
              _hover={{
                bg: "gray.50",
                borderColor: "gray.400",
              }}
            >
              キャンセル
            </Button>
          </Link>

          <CheckDialog
            coinLaundry={coinLaundry}
            checked={checked}
            machinesAndFunds={machinesAndFunds}
            moneyTotal={moneyTotal}
            epoc={epoc}
            setMsg={setMsg}
          />
        </Card.Footer>

        {msg && (
          <Box px={8} pb={8}>
            <Flex
              align="center"
              gap={3}
              p={4}
              bg="red.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="red.200"
            >
              <Icon.LiaStoreSolid />
              <Text color="red.700" fontSize="sm" fontWeight="medium">
                {msg}
              </Text>
            </Flex>
          </Box>
        )}
      </Card.Root>
    </Box>
  );
};

export default CollectMoneyForm;
