"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CloseButton,
  Container,
  Dialog,
  Flex,
  HStack,
  Heading,
  Portal,
  Separator,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

import * as Icon from "@/app/feacher/Icon";
import BackfillRow from "./BackfillRow";
import { createData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { createMessage } from "@/app/api/supabaseFunctions/supabaseDatabase/actionMessage/action";
import { showToast } from "@/functions/makeToast/toast";
import { getEpochTimeInSeconds } from "@/functions/makeDate/date";

/**
 * 一度に積める行数の上限。
 *
 * ⚠️ **iOS 版の `OUTBOX_LIMIT` とは別の理由で決めた数字で、たまたま同じ 50。**
 *    あちらは送信キューの容量という端末側の都合だが、Web は Server Action を
 *    直接呼べるのでキューが無い。こちらの根拠は 3 つ:
 *      - 週 1 回の集金なら約 1 年ぶん。「過去を入れ直す」1 回の操作として妥当な量
 *      - 送信は 1 行 1 呼び出しの逐次なので、押してから終わるまでの待ちと、
 *        途中で失敗したときに**既に入っている件数**をこれで抑える
 *      - 読み取り側（一覧・月別サマリー）が共有する PostgREST の 1000 行上限に
 *        対しても十分小さい
 *    ⚠️ **増やすときは逐次送信のままでよいか併せて考えること。**
 */
const MAX_ROWS = 50;

/** 今日の JST 深夜 0 時。⚠️ `Date.now()` をそのまま使わず必ず年月日に分解して通す */
function todayJstMidnight() {
  const now = new Date();
  return getEpochTimeInSeconds(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

let rowSeq = 0;
const makeRow = (date) => ({ key: `row-${rowSeq++}`, date, amount: "" });

/**
 * 過去の集金データの一括入力。
 *
 * 新規ユーザーが「これまでの記録を入れ直すのが面倒」で使い始めてくれない、という
 * 課題への対応。**収益グラフを初日から意味のあるものにする**のが目的なので、
 * 機種別の内訳は取らず「集金日 + 合計金額」だけを受ける。
 *
 * ⚠️ **新しい Server Action を作らない。** 合計入力モードの集金とまったく同じ形で
 *    既存の `createData` を行ごとに呼ぶだけ。送る形（docs/ios の規約と同じ）:
 *      `{ storeId, store, date, fundsArray: [], totalFunds: <円>, cashless: [] }`
 *
 * ⚠️ **`totalFunds` は「現金ぶん」として渡す。** DB の `collect_funds.totalFunds` は
 *    「総額」で、**同じ名前で意味が違う。** 総額を組み立てるのはサーバ（`createData` が
 *    `totalFunds + cashless.sum` で作る）。キャッシュレスを取らない画面なので結果的に
 *    現金ぶん = 総額になるが、規約は変わらないので画面の合計をそのまま渡さないこと。
 *    （Web の `TotalFundsList.jsx` が過去にこれで「開いて保存するだけで金額が膨らむ」
 *    不具合を出している。）
 *
 * ⚠️ **キャッシュレスの内訳を取らないので、登録ぶんは支払方法別の集計で「現金」に寄る。**
 *    過去分を方法別に思い出すのは現実的でないため**意図した仕様**で、画面にもその旨を
 *    出してある（消さないこと）。機種別の内訳も残らないので、集金データの詳細では
 *    「合計金額」として表示される。壊れているわけではない。
 *
 * ⚠️ **月別売上カードは過去 2 年ぶんしか引かない**（`getCollectMonthlySummary` の
 *    cutoff）。それより古いぶんを入れても収益グラフには出るがカードには出ない。
 *    日付に下限を設けていないのは、グラフが任意の期間まで遡れるため。
 */
const BackfillForm = ({ coinLaundry }) => {
  const router = useRouter();
  const [rows, setRows] = useState(() => [makeRow(todayJstMidnight())]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  /*
    確認ダイアログは**制御する**。
    ⚠️ 登録ボタンを `Dialog.ActionTrigger` にすると押した瞬間に閉じてしまい、
       逆に素のボタンのままだと**失敗してもダイアログが開いたままで、下に出した
       エラーメッセージが隠れる。** 失敗したときだけこちらで閉じる。
  */
  const [confirmOpen, setConfirmOpen] = useState(false);

  /** 金額が入っている行だけが登録対象。空欄の行は黙って無視する */
  const filled = rows.filter((row) => Number(row.amount) > 0);
  const total = filled.reduce((sum, row) => sum + Number(row.amount), 0);
  const atCapacity = rows.length >= MAX_ROWS;

  /** 同じ集金日が 2 行以上あるか。⚠️ 注意だけ出し、登録は妨げない */
  const duplicatedDates = useMemo(() => {
    const counts = new Map();
    rows.forEach((row) => counts.set(row.date, (counts.get(row.date) ?? 0) + 1));
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([date]) => date));
  }, [rows]);

  const addRow = () => {
    setRows((prev) => {
      if (prev.length >= MAX_ROWS) return prev;
      /*
        直前の行と同じ日付から始める。
        ⚠️ **勝手に 1 週間前へずらさない。** 集金の頻度は店舗ごとに違い、遡る方向も
           一定ではないので、行ごとに指定させる（iOS 版と同じ判断）。
      */
      const last = prev[prev.length - 1];
      return [...prev, makeRow(last?.date ?? todayJstMidnight())];
    });
  };

  const updateRow = (key, patch) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.key !== key)));
  };

  const postHandler = async () => {
    setIsLoading(true);
    setMsg("");

    /** 登録できた行。⚠️ 失敗時にフォームから取り除くために key を覚える */
    const doneKeys = [];
    let failure = "";
    /*
      ⚠️ **例外で落ちた行は「登録されたか分からない」。** Server Action が応答を
         返せなかった場合（通信断など）、INSERT が通ってから切れた可能性がある。
         Web は冪等性キーを送らないので DB 側で重複を止められず、
         **黙って消すと集金額が欠け、黙って残すと押し直しで二重計上になる。**
         どちらにも倒さず、行は残したうえで「一覧で確認してから」と明示する。
    */
    let unknownRow = false;

    try {
      for (const row of filled) {
        const { data, error } = await createData({
          store: coinLaundry.store,
          storeId: coinLaundry.id,
          /*
            ⚠️ **JST 深夜 0 時ちょうどを入れる。ずらさないこと。**
               規約が `collect_funds.date` を「JST 深夜 0 時の epoch」と定義しており、
               既存の登録（`SelectDate.jsx`）も `getEpochTimeInSeconds` の値をそのまま
               使っている。ここだけずらすと規約が嘘になり、それを信じて `.eq("date")`
               を書いた人が静かに壊れる。
               ⚠️ 同じ日付が並ぶとページングで行が重複・欠落する件は、**読み取り側**で
                  直してある（`getStoreFundsPaginated` の `.order("id")`）。
                  書き込み側でデータを歪めて回避しないこと。
          */
          date: row.date,
          // 過去分は機種別の内訳を取らないので空。合計入力モードの集金と同じ形
          fundsArray: [],
          /*
            ⚠️ **現金ぶんとして渡す。** サーバが `totalFunds + cashless.sum` で総額を
               組み直すので、ここで足すと二重計上になる。単位は「円」（枚数ではない）。
          */
          totalFunds: Number(row.amount),
          // 過去分は支払方法別の内訳を取らない。全額「現金」に寄るのは意図した仕様
          cashless: [],
        });

        if (error || !data) {
          // ⚠️ `createData` は文字列と `{ msg, status }` の両方を返す
          failure =
            typeof error === "string" ? error : error?.msg || "集金データの登録に失敗しました";
          break;
        }
        doneKeys.push(row.key);
      }
    } catch (e) {
      console.error("API Error:", e);
      failure = e instanceof Error && e.message ? e.message : "集金データの登録に失敗しました";
      unknownRow = true;
    }

    /*
      アクションログは**まとめて 1 行**にする。
      ⚠️ **`createData` はログを書かない。** 書いているのは呼び出し側（集金登録なら
         `CheckDialogCollectMoney` の `createMessage`）なので、N 行並ぶかはここの裁量。
      ⚠️ **1 行に畳む理由:** ログは組織で共有する活動履歴で、一括入力で同じ文面が
         数十行積まれると他の操作が埋まって読めなくなる。さらに `action_message` は
         PostgREST の 1000 行上限に当たる側（`actionMessage/action.js` の注記）なので、
         1 回の操作で数十行使うと履歴の寿命をそのぶん縮める。
      ⚠️ **iOS 版（BFF 経由）は 1 POST ごとに `logAction` するので N 行になる。**
         揃えていないのは意図的で、あちらは 1 行ずつ Outbox から送るため
         「何件まで送れたか」がログでしか追えない。Web は同期で結果を返せる。
    */
    if (doneKeys.length > 0) {
      const { error: logError } = await createMessage(
        `${coinLaundry.store}店の過去の集金データ ${doneKeys.length} 件を登録しました`
      );
      if (logError) console.log("メッセージアクションにエラーが発生しました");
    }

    if (failure) {
      /*
        ⚠️ **登録できた行をフォームから取り除く。** 残したまま押し直すと、
           既に入っている行がもう一度登録されて**二重計上になる。**
           Web は冪等性キーを送らない（`client_request_id` は NULL）ので
           DB 側では止められない。
      */
      setRows((prev) => {
        const rest = prev.filter((row) => !doneKeys.includes(row.key));
        return rest.length > 0 ? rest : [makeRow(todayJstMidnight())];
      });
      const parts = [];
      if (doneKeys.length > 0) parts.push(`${doneKeys.length} 件を登録しました。`);
      if (unknownRow) {
        parts.push(
          "通信が途切れたため、次の 1 件は登録できたか分かりません。" +
            "集金データ一覧で確認してから登録し直してください。"
        );
      } else if (doneKeys.length > 0) {
        parts.push("残りは登録されていません。");
      }
      parts.push(`(${failure})`);
      setMsg(parts.join(""));
      showToast("error", `集金データの登録に失敗しました`);
      setIsLoading(false);
      // ⚠️ 閉じないとエラーメッセージがダイアログの裏に隠れる
      setConfirmOpen(false);
      return;
    }

    sessionStorage.setItem(
      "toast",
      JSON.stringify({
        description: `${coinLaundry.store}店の過去の集金データ ${doneKeys.length} 件を登録しました。`,
        type: "success",
        closable: true,
      })
    );

    router.push(`/coinLaundry/${coinLaundry.id}/coinDataList`);
  };

  return (
    <Container maxW="900px" p={{ base: 4, md: 6 }}>
      <VStack align="stretch" gap={5}>
        <Box>
          <Flex
            gap={1}
            align="center"
            color="var(--text-muted)"
            fontSize="sm"
            cursor="pointer"
            _hover={{ color: "var(--text-main)" }}
            onClick={() => router.push(`/coinLaundry/${coinLaundry.id}`)}
          >
            <Icon.LuChevronLeft size={16} />
            <Text>{coinLaundry.store}店</Text>
          </Flex>
        </Box>

        <Box>
          <HStack gap={2} mb={1}>
            <Icon.LuHistory size={24} color="var(--teal, #0891B2)" />
            <Heading fontSize={{ base: "xl", md: "2xl" }} color="var(--text-main, #1E3A5F)">
              過去の集金データ
            </Heading>
          </HStack>
          <Text fontSize="sm" color="var(--text-muted, #64748B)">
            {coinLaundry.store}店
          </Text>
        </Box>

        {/*
          ⚠️ **この注記を消さないこと。** キャッシュレスの内訳を取らないので、
             登録ぶんは支払方法別の集計で全額「現金」に寄る。意図した仕様である旨を
             画面で伝えておかないと、あとから「金額が現金に化けた」と読まれる
             （iOS 版と同じ文面）。
        */}
        <HStack
          gap={2}
          align="flex-start"
          p={4}
          borderRadius="xl"
          bg="var(--teal-pale, #CFFAFE)"
          borderWidth="1px"
          borderColor="cyan.200"
        >
          <Box color="var(--teal, #0891B2)" pt="2px">
            <Icon.LuInfo size={16} />
          </Box>
          <Text fontSize="sm" color="var(--teal-deeper, #155E75)" lineHeight="tall">
            過去分は「集金日」と「合計金額」だけを登録します。機種ごとの内訳は残らず、
            金額は全額「現金」として扱われます。
          </Text>
        </HStack>

        <Box>
          {rows.map((entry, index) => (
            <BackfillRow
              key={entry.key}
              index={index}
              entry={entry}
              duplicated={duplicatedDates.has(entry.date)}
              removable={rows.length > 1}
              onChangeDate={(date) => updateRow(entry.key, { date })}
              onChangeAmount={(amount) =>
                // ⚠️ 数字以外は捨てる。全角や記号が混ざると Number() が NaN になる
                updateRow(entry.key, { amount: amount.replace(/[^0-9]/g, "") })
              }
              onRemove={() => removeRow(entry.key)}
            />
          ))}

          <Button
            variant="outline"
            w="full"
            borderStyle="dashed"
            borderWidth="2px"
            borderColor="cyan.200"
            color="var(--teal-deeper, #155E75)"
            fontWeight="semibold"
            disabled={atCapacity || isLoading}
            onClick={addRow}
            _hover={{ bg: "var(--teal-pale, #CFFAFE)" }}
          >
            <Icon.LuPlus />
            {atCapacity ? `これ以上は追加できません（上限 ${MAX_ROWS} 件）` : "行を追加"}
          </Button>

          {atCapacity && (
            <Text fontSize="xs" color="var(--text-muted, #64748B)" mt={2} textAlign="center">
              先に登録すると、続きを入力できます
            </Text>
          )}
        </Box>

        {msg && (
          <HStack
            gap={2}
            align="flex-start"
            p={4}
            borderRadius="lg"
            bg="red.50"
            borderWidth="1px"
            borderColor="red.200"
          >
            <Box color="red.500" pt="2px">
              <Icon.LuTriangleAlert size={16} />
            </Box>
            <Text fontSize="sm" color="red.700">
              {msg}
            </Text>
          </HStack>
        )}

        <Separator />

        {/* 件数と合計金額は常時表示。入力中にいくら入れたのかが分からないと手が止まる */}
        <Flex
          justify="space-between"
          align="center"
          p={5}
          borderRadius="xl"
          bg="var(--card-bg, #FFFFFF)"
          borderWidth="2px"
          borderColor="cyan.200"
          position="sticky"
          bottom={4}
          boxShadow="0 4px 14px rgba(8,145,178,0.14)"
        >
          <Box>
            <Text fontSize="sm" color="var(--text-muted, #64748B)">
              登録する件数
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="var(--text-main, #1E3A5F)">
              {filled.length} 件
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="sm" color="var(--text-muted, #64748B)">
              合計金額
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper, #155E75)">
              ¥{total.toLocaleString()}
            </Text>
          </Box>
        </Flex>

        <Dialog.Root
          role="alertdialog"
          size="md"
          placement="center"
          motionPreset="slide-in-bottom"
          open={confirmOpen}
          // 送信中は閉じさせない（二重送信と、途中結果の取りこぼしを防ぐ）
          onOpenChange={(e) => !isLoading && setConfirmOpen(e.open)}
        >
          <Dialog.Trigger asChild>
            <Button
              size="lg"
              color="white"
              fontWeight="semibold"
              disabled={filled.length === 0 || isLoading}
              style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
              boxShadow="0 4px 14px rgba(8,145,178,0.28)"
              _hover={{ transform: "translateY(-1px)" }}
              _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
              transition="all 0.2s"
            >
              {isLoading && <Spinner size="sm" mr={2} />}
              まとめて登録
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <Dialog.Positioner>
              <Dialog.Content borderRadius="20px" maxW="480px" mx={4} overflow="hidden">
                <Dialog.Header
                  style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                  color="white"
                  py={5}
                  px={6}
                >
                  <Dialog.Title fontSize="lg" fontWeight="bold">
                    {filled.length} 件を登録しますか？
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body py={6} px={6}>
                  <Stack gap={3}>
                    <Text fontSize="sm" color="var(--text-muted, #64748B)">
                      合計 ¥{total.toLocaleString()} を {coinLaundry.store}店 の集金データとして
                      登録します。
                    </Text>
                    {duplicatedDates.size > 0 && (
                      <HStack gap={2} align="flex-start" color="orange.600">
                        <Box pt="2px">
                          <Icon.LuTriangleAlert size={14} />
                        </Box>
                        <Text fontSize="xs">
                          同じ集金日の行があります。1 日に 2 回集金した記録として、そのまま
                          登録されます。
                        </Text>
                      </HStack>
                    )}
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer py={4} px={6} bg="var(--app-bg, #F0F9FF)">
                  <Flex gap={3} justify="flex-end" w="full">
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline" size="lg" disabled={isLoading} fontWeight="semibold">
                        キャンセル
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button
                      onClick={postHandler}
                      size="lg"
                      color="white"
                      fontWeight="semibold"
                      disabled={isLoading}
                      style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
                      _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                    >
                      {isLoading && <Spinner size="sm" mr={2} />}
                      登録する
                    </Button>
                  </Flex>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" position="absolute" top={4} right={4} color="white" disabled={isLoading} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </VStack>
    </Container>
  );
};

export default BackfillForm;
