"use client";

import { useEffect, useState } from "react";
import { Box, Card, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

import EpochTimeSelector from "../selectDate/SelectDate";
import MachineAndMoney from "./CardContext/MachineAndMoney";
import MoneyTotal from "./CardContext/MoneyTotal";
import CollectMoneyHeader from "./CollectMoneyHeader";
import CollectMoneyFooter from "./CollectMoneyFooter";
import CollectMethodCard from "./CollectMethodCard";
import DraftBanner from "./parts/DraftBanner";
import * as Icon from "@/app/feacher/Icon";

const draftKey = (storeId) => `draft_collect_${storeId}`;

const CollectMoneyForm = ({ coinLaundry }) => {
  const supabase = createClient();
  const router = useRouter();

  const [epoc, setEpoc] = useState(Date.now());
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [fixed, setFixed] = useState(null);
  const [moneyTotal, setMoneyTotal] = useState();
  const [machinesAndFunds, setMachinesAndFunds] = useState(() =>
    coinLaundry.machines.map((machine) => ({
      machine,
      funds: null,
      weight: null,
      toggle: false,
    }))
  );
  const [draft, setDraft] = useState(null); // { epoc, checked, machinesAndFunds, moneyTotal, savedAt }

  // プロフィールから集金方式を読み込む
  useEffect(() => {
    const loadUserMethod = async () => {
      setLoading(true);
      const { user } = await getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("collectMethod")
        .eq("id", user.id)
        .single();

      if (!error && data && data.collectMethod !== null) {
        setChecked(data.collectMethod === "machines");
        setFixed(true);
      } else {
        setChecked(false);
        setFixed(false);
      }
      setLoading(false);
    };

    loadUserMethod();
  }, []);

  // 一時保存データの確認（マウント時のみ）
  useEffect(() => {
    const saved = localStorage.getItem(draftKey(coinLaundry.id));
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch {
        localStorage.removeItem(draftKey(coinLaundry.id));
      }
    }
  }, [coinLaundry.id]);

  const saveDraft = () => {
    const data = {
      epoc,
      checked,
      machinesAndFunds,
      moneyTotal,
      savedAt: Date.now(),
    };
    localStorage.setItem(draftKey(coinLaundry.id), JSON.stringify(data));
    setDraft(data);
  };

  const restoreDraft = () => {
    if (!draft) return;
    setEpoc(draft.epoc);
    setChecked(draft.checked);
    setMachinesAndFunds(draft.machinesAndFunds);
    setMoneyTotal(draft.moneyTotal);
    setDraft(null);
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey(coinLaundry.id));
    setDraft(null);
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey(coinLaundry.id));
  };

  const toggleChangeMethod = (e) => {
    const value = e.checked;
    setChecked(value);
    if (fixed) uploadProfilesMethod(value);
  };

  const toggleChangeFixed = (e) => {
    const isFixed = e.checked;
    setFixed(isFixed);
    uploadProfilesMethod(isFixed ? checked : null);
  };

  const uploadProfilesMethod = async (method) => {
    const { user } = await getUser();
    if (!user) return;
    const collectMethod =
      method === null ? null : method ? "machines" : "total";
    await supabase
      .from("profiles")
      .update({ collectMethod })
      .eq("id", user.id);
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
              onRestore={restoreDraft}
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
            onMethodChange={toggleChangeMethod}
            onFixedChange={toggleChangeFixed}
          />

          {/* 金額入力 */}
          <Box>
            {checked ? (
              <MachineAndMoney
                machinesAndFunds={machinesAndFunds}
                setMachinesAndFunds={setMachinesAndFunds}
              />
            ) : (
              <Card.Root bg="white" shadow="md" borderRadius="2xl" overflow="hidden">
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
        onSaveDraft={saveDraft}
        clearDraft={clearDraft}
      />
    </VStack>
  );
};

export default CollectMoneyForm;
