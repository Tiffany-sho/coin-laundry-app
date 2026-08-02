"use client";

import { useState } from "react";
import { Box, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import EpochTimeSelector from "../selectDate/SelectDate";
import MachineAndMoney from "./CardContext/MachineAndMoney";
import MoneyTotal from "./CardContext/MoneyTotal";
import CollectMoneyHeader from "./CollectMoneyHeader";
import CollectMoneyFooter from "./CollectMoneyFooter";
import CollectMethodCard from "./CollectMethodCard";
import CashlessInputs from "./CardContext/CashlessInputs";
import DraftBanner from "./parts/DraftBanner";
import useDraft from "../../hooks/useDraft";
import useCollectMethod from "../../hooks/useCollectMethod";
import * as Icon from "@/app/feacher/Icon";

const SectionDivider = () => (
  <Box h="1px" bg="var(--divider, #F1F5F9)" />
);

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

  /**
   * キャッシュレスの入力（`{ [methodId]: "1200" }`）。
   * ⚠️ **無効にした支払方法は出さない。** `attachPaymentMethods` は
   *    店舗フォームで戻せるように `isActive: false` も返してくる。
   */
  const activeMethods = (coinLaundry.paymentMethods ?? []).filter((m) => m.isActive);
  const [cashless, setCashless] = useState({});
  const handleCashlessChange = (methodId, value) =>
    setCashless((prev) => ({ ...prev, [methodId]: value }));

  const { checked, fixed, loading, handleMethodChange, handleFixedChange } =
    useCollectMethod();

  const { draft, saveDraft, discardDraft, clearDraft } = useDraft(
    coinLaundry.id
  );

  const handleSaveDraft = () => {
    // ⚠️ cashless も含める。含めないと復元したときにキャッシュレスだけ黙って消える
    saveDraft({ epoc, checked, machinesAndFunds, moneyTotal, cashless });
  };

  const handleRestoreDraft = () => {
    if (!draft) return;
    setEpoc(draft.epoc);
    setMachinesAndFunds(draft.machinesAndFunds);
    setMoneyTotal(draft.moneyTotal);
    // ⚠️ cashless を持たない古い下書きも復元できるようにする
    setCashless(draft.cashless ?? {});
    discardDraft();
  };

  return (
    <VStack spacing={0} minH="100vh" bg="var(--app-bg, #F0F9FF)">
      <CollectMoneyHeader storeName={coinLaundry.store} />

      <Box
        w="full"
        pt={{ base: 20, md: 24 }}
        pb={{ base: 32, md: 36 }}
        px={{ base: 4, md: 8 }}
        maxW="700px"
        mx="auto"
      >
        <Stack gap={0}>
          {draft && (
            <Box pb={4}>
              <DraftBanner
                savedAt={draft.savedAt}
                onRestore={handleRestoreDraft}
                onDiscard={discardDraft}
              />
            </Box>
          )}

          {/* 集金日 */}
          <Box py={{ base: 5, md: 6 }}>
            <HStack mb={4} color="var(--teal, #0891B2)">
              <Icon.LuCalendar size={20} />
              <Text fontSize="md" fontWeight="semibold">
                集金日
              </Text>
            </HStack>
            <EpochTimeSelector epoc={epoc} setEpoc={setEpoc} />
          </Box>

          <SectionDivider />

          {/* 集金方式 */}
          <CollectMethodCard
            checked={checked}
            fixed={fixed}
            loading={loading}
            onMethodChange={handleMethodChange}
            onFixedChange={handleFixedChange}
          />

          <SectionDivider />

          {/* 金額入力 */}
          <Box py={{ base: 5, md: 6 }}>
            <HStack mb={4} color="var(--teal, #0891B2)">
              <Icon.RiMoneyCnyCircleLine size={20} />
              <Text fontSize="md" fontWeight="semibold">
                {checked ? "機種別金額" : "合計金額"}
              </Text>
            </HStack>
            {checked ? (
              <MachineAndMoney
                machinesAndFunds={machinesAndFunds}
                setMachinesAndFunds={setMachinesAndFunds}
                methods={activeMethods}
              />
            ) : (
              <MoneyTotal
                moneyTotal={moneyTotal}
                setMoneyTotal={setMoneyTotal}
              />
            )}
          </Box>

          {/*
            キャッシュレス（店舗に支払方法が登録されているときだけ出る）。
            ⚠️ **機種別入力のときは出さない。** 設備ごとに入力できるので、
               両方あると同じ金額を 2 か所に書けてしまう。サーバは設備の側を
               正とする（`hasMachineCashless`）ので、**集金レベルに入れた分は
               黙って消える。**
          */}
          {activeMethods.length > 0 && !checked && (
            <>
              <SectionDivider />
              <CashlessInputs
                methods={activeMethods}
                values={cashless}
                onChange={handleCashlessChange}
              />
            </>
          )}

          {msg && (
            <>
              <SectionDivider />
              <Box py={4}>
                <HStack>
                  <Icon.LiaStoreSolid size={18} color="var(--chakra-colors-red-500)" />
                  <Text color="red.600" fontSize="sm" fontWeight="medium">
                    {msg}
                  </Text>
                </HStack>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      <CollectMoneyFooter
        machinesAndFunds={machinesAndFunds}
        checked={checked}
        moneyTotal={moneyTotal}
        cashless={cashless}
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
