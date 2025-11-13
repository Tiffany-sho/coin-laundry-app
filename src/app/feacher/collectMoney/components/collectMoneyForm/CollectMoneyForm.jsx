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
} from "@chakra-ui/react";
import Link from "next/link";
import EpochTimeSelector from "../selectDate/SelectDate";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney";

import MachineAndMoney from "./MachineAndMoney";
import MoneyTotal from "./MoneyTotal";

import { RiMoneyCnyCircleLine } from "react-icons/ri";
import { MdDateRange } from "react-icons/md";
import FixSwitch from "./FixSwitch";
import { createClient } from "@/utils/supabase/client";

const CollectMoneyForm = ({ coinLaundry }) => {
  const [epoc, setEpoc] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [checked, setChecked] = useState(false);
  const [fixed, setFixed] = useState(null);
  const [machinesAndFunds, setMachinesAndFunds] = useState(() => {
    const initialValue = coinLaundry.machines.map((machine) => ({
      machine,
      funds: null,
      weight: null,
      toggle: false,
    }));
    return initialValue;
  });
  const [moneyTotal, setMoneyTotal] = useState();

  useEffect(() => {
    const getUserFixed = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("collectMethod")
        .eq("id", user.id)
        .single();

      if (data && data.collectMethod !== null) {
        setChecked(data.collectMethod);
        setFixed(true);
      } else {
        setFixed(false);
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

    const { error } = await supabase
      .from("profiles")
      .update({ collectMethod: method })
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
        boxShadow="xl"
        borderRadius="2xl"
        overflow="hidden"
      >
        <Card.Header color="white" py={6} px={8}>
          <Flex justify="space-between" align="center">
            <Card.Title fontSize="2xl" fontWeight="bold" color="gray.800">
              {coinLaundry.store}店
            </Card.Title>
            <Badge
              bg="white"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="bold"
              fontSize="md"
            >
              集金登録
            </Badge>
          </Flex>
        </Card.Header>

        <Card.Body py={8} px={8}>
          <Stack gap={8} w="full">
            <Box
              p={5}
              bg="white"
              borderRadius="xl"
              borderWidth="2px"
              borderColor="gray.200"
              shadow="sm"
              transition="all 0.2s"
              _hover={{ borderColor: "blue.300", shadow: "md" }}
            >
              <HStack mb={3}>
                <MdDateRange size={24} />
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  集金日
                </Text>
              </HStack>

              <EpochTimeSelector epoc={epoc} setEpoc={setEpoc} />
            </Box>

            <Box
              p={5}
              bg="white"
              borderRadius="xl"
              borderWidth="2px"
              borderColor="gray.200"
              shadow="sm"
            >
              <Flex align="center" justify="space-between">
                <Box>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    {checked ? "機種別集金" : "まとめて集金"}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {checked
                      ? "各機種ごとに金額を入力します"
                      : "合計金額のみを入力します"}
                  </Text>
                </Box>
                <Stack>
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
                  <FixSwitch
                    toggleChangeFixed={toggleChangeFixed}
                    fixed={fixed}
                  />
                </Stack>
              </Flex>
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
                  bg="white"
                  borderRadius="xl"
                  borderWidth="2px"
                  borderColor="gray.200"
                  shadow="sm"
                >
                  <HStack mb={6}>
                    <RiMoneyCnyCircleLine size={24} />
                    <Text fontSize="md" fontWeight="semibold" color="gray.600">
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
          borderTop="2px"
          borderColor="gray.100"
          bg="gray.50"
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
                bg: "gray.100",
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
              borderWidth="2px"
              borderColor="red.200"
            >
              <Text fontSize="lg">⚠️</Text>
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
