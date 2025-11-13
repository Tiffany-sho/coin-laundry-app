"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  HStack,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import EpochTimeSelector from "./selectDate/SelectDate";
import CheckDialog from "@/app/feacher/dialog/CheckDialogCollectMoney/CheckDialogCollectMoney";

import MachineAndMoney from "./MachineAndMoney";
import MoneyTotal from "./MoneyTotal";

const CollectMoneyForm = ({ coinLaundry }) => {
  const [epoc, setEpoc] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [checked, setChecked] = useState(false);
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
            <HStack>
              <Switch.Root
                checked={checked}
                onCheckedChange={(e) => setChecked(e.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label />
              </Switch.Root>
            </HStack>
            <Text>{checked ? "機種別集金" : "まとめて集金"}</Text>
          </Stack>
          {checked ? (
            <MachineAndMoney
              machinesAndFunds={machinesAndFunds}
              setMachinesAndFunds={setMachinesAndFunds}
            />
          ) : (
            <MoneyTotal moneyTotal={moneyTotal} setMoneyTotal={setMoneyTotal} />
          )}
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
          <Link href={`/coinLaundry/${coinLaundry.id}`}>
            <Button
              variant="outline"
              size="lg"
              colorScheme="gray"
              fontWeight="medium"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                outline: "none",
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
    </Box>
  );
};

export default CollectMoneyForm;
