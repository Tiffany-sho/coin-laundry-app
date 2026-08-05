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
import { normalizeScope, showsCash, showsCashless } from "@/functions/collectScope";
import * as Icon from "@/app/feacher/Icon";

const SectionDivider = () => (
  <Box h="1px" bg="var(--divider, #F1F5F9)" />
);

/**
 * @param scope 何を記録するか（`?scope=` から来る）。
 *   ⚠️ **未指定は `"both"`**（`normalizeScope`）。ブックマークや通知など
 *      scope を持たない経路から開かれたときに、**入力欄が黙って消えている**
 *      状態にしないため。アプリと同じ規約。
 */
const CollectMoneyForm = ({ coinLaundry, scope: rawScope }) => {
  const router = useRouter();
  const scope = normalizeScope(rawScope);
  const withCash = showsCash(scope);
  const withCashless = showsCashless(scope);

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

  const { checked, setChecked, fixed, loading, handleMethodChange, handleFixedChange } =
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
    /*
      ⚠️ **集金方法も戻す。** 保存はしていたのに戻していなかったため、
         機種別で書いた下書きを合計入力の状態で復元すると、**設備ごとの金額が
         画面に出ないまま `moneyTotal`（空）で登録され、入力が丸ごと消えていた。**
      ⚠️ `handleMethodChange` ではなく `setChecked` を使う。あちらは既定の
         集金方法まで書き換えるので、下書きを戻しただけで設定が変わってしまう。
      ⚠️ 集金方法を持たない古い下書きは今の状態のままにする（勝手に切り替えない）。
    */
    if (typeof draft.checked === "boolean") setChecked(draft.checked);
    setMachinesAndFunds(draft.machinesAndFunds);
    setMoneyTotal(draft.moneyTotal);
    // ⚠️ cashless を持たない古い下書きも復元できるようにする
    setCashless(draft.cashless ?? {});
    discardDraft();
  };

  /*
    scope に合わせた「実際に送る値」。**ここで 1 度だけ作る。**
    ⚠️ フッターと確認ダイアログはこれをそのまま使う。下流に scope の分岐を
       撒くと、**画面の見込み額と登録される金額が食い違う**（両方が同じ
       state から別々に計算しているため、片方だけ直すと必ずずれる）。
    ⚠️ **現金のみ**… 機器ごとのぶんも含めてキャッシュレスを落とす。
       欄を消すだけでは、合計入力で入れてから切り替えた分が state に残る。
    ⚠️ **現金以外のみ**… 現金は必ず 0。集金方式（機種別 / 合計）も無関係に
       なるので合計入力として送る（アプリと同じ規約）。
  */
  const submitChecked = withCash ? checked : false;
  const submitMoneyTotal = withCash ? moneyTotal : 0;
  const submitMachines = withCash
    ? withCashless
      ? machinesAndFunds
      : machinesAndFunds.map(({ cashless: _drop, ...rest }) => rest)
    : [];
  const submitCashless = withCashless ? cashless : {};

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

          {/*
            ⚠️ **現金を記録しないときは集金方式ごと出さない。** 機種別 / 合計は
               どちらも「硬貨をどう数えるか」の話なので、現金以外だけを記録する
               ときは選ばせる意味が無い。
          */}
          {withCash && (
            <>
              <SectionDivider />
              <CollectMethodCard
                checked={checked}
                fixed={fixed}
                loading={loading}
                onMethodChange={handleMethodChange}
                onFixedChange={handleFixedChange}
              />
            </>
          )}

          {withCash && (
            <>
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
                /* ⚠️ 現金のみのときは機器ごとのキャッシュレス欄も出さない。
                      出すと「現金のみ」と言いながらキャッシュレスを入れられる */
                methods={withCashless ? activeMethods : []}
              />
            ) : (
              <MoneyTotal
                moneyTotal={moneyTotal}
                setMoneyTotal={setMoneyTotal}
              />
            )}
          </Box>
            </>
          )}

          {/*
            キャッシュレス（店舗に支払方法が登録されているときだけ出る）。
            ⚠️ **機種別入力のときは出さない。** 設備ごとに入力できるので、
               両方あると同じ金額を 2 か所に書けてしまう。サーバは設備の側を
               正とする（`hasMachineCashless`）ので、**集金レベルに入れた分は
               黙って消える。**
          */}
          {withCashless && activeMethods.length > 0 && (!checked || !withCash) && (
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
        machinesAndFunds={submitMachines}
        checked={submitChecked}
        moneyTotal={submitMoneyTotal}
        cashless={submitCashless}
        scope={scope}
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
