"use client";

import { useState } from "react";
import { Box, Card, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import EpochTimeSelector from "../selectDate/SelectDate";
import MachineAndMoney from "./CardContext/MachineAndMoney";
import MoneyTotal from "./CardContext/MoneyTotal";
import CollectMoneyHeader from "./CollectMoneyHeader";
import CollectMoneyFooter from "./CollectMoneyFooter";
import CollectMethodCard from "./CollectMethodCard";
import DraftBanner from "./parts/DraftBanner";
import useDraft from "../../hooks/useDraft";
import useCollectMethod from "../../hooks/useCollectMethod";
import * as Icon from "@/app/feacher/Icon";

const CollectMoneyForm = ({ coinLaundry }) => {
  const router = useRouter();

  const [epoc, setEpoc] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [moneyTotal, setMoneyTotal] = useState();
  const [machinesAndFunds, setMachinesAndFunds] = useState(() =>
    coinLaundry.machines.map((machine) => ({
      machine,
      funds: null,
      weight: null,
      toggle: false,
    }))
  );

  const { checked, fixed, loading, handleMethodChange, handleFixedChange } =
    useCollectMethod();

  const { draft, saveDraft, discardDraft, clearDraft } = useDraft(
    coinLaundry.id
  );

  const handleSaveDraft = () => {
    saveDraft({ epoc, checked, machinesAndFunds, moneyTotal });
  };

  const handleRestoreDraft = () => {
    if (!draft) return;
    setEpoc(draft.epoc);
    setMachinesAndFunds(draft.machinesAndFunds);
    setMoneyTotal(draft.moneyTotal);
    discardDraft();
  };

  return (
    <VStack spacing={0} minH="100vh" bg="gray.50">
      <CollectMoneyHeader storeName={coinLaundry.store} />

      <Box
        w="full"
        pt={{ base: 20, md: 24 }}
        pb={{ base: 32, md: 36 }}
        px={{ base: 4, md: 8 }}
      >
        <Stack gap={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
          {draft && (
            <DraftBanner
              savedAt={draft.savedAt}
              onRestore={handleRestoreDraft}
              onDiscard={discardDraft}
            />
          )}

          {/* 集金日 */}
          <Card.Root
            bg="white"
            shadow="md"
            borderRadius="2xl"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
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

          {/* 集金方式 */}
          <CollectMethodCard
            checked={checked}
            fixed={fixed}
            loading={loading}
            onMethodChange={handleMethodChange}
            onFixedChange={handleFixedChange}
          />

          {/* 金額入力 */}
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

      <CollectMoneyFooter
        machinesAndFunds={machinesAndFunds}
        checked={checked}
        moneyTotal={moneyTotal}
        coinLaundry={coinLaundry}
        epoc={epoc}
        setMsg={setMsg}
        onCancel={() => router.back()}
        onSaveDraft={handleSaveDraft}
        clearDraft={clearDraft}
      />
    </VStack>
  );
};

export default CollectMoneyForm;
