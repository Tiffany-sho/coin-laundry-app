"use client";

import { useState } from "react";
import { Badge, Box, Button, Editable, Flex, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import { buildMethodRows } from "@/functions/cashlessMath";

/**
 * 支払方法ごとの金額。集金 1 件の内訳をここで直す。
 *
 * ⚠️ **2026-08-02 まで Web にはこの欄が無かった。** 集金レコードは `cashless` を
 *    持っているのに画面が読まないので、**PayPay の金額を間違えて登録すると
 *    Web からは見ることも直すこともできなかった**（アプリだけが編集できた）。
 *
 * `cashRow` を渡すと**現金も同じ表に並べる**（合計入力モードの集金）。
 * ⚠️ **大きい数字は総額 1 つだけにすること。** 「合計売上」と「現金」を同じ大きさで
 *    2 つ並べていたときは、どちらを直せばよいのか分からなかった。
 * ⚠️ 現金を行として**表示**するだけで、データとしては持たない
 *    （`payment_methods` に現金の行は無く、`総額 − Σcashless` で出す）。
 *
 * ⚠️ **機器ごとの内訳を持つ集金では編集させない。** その場合 `cashless` 列は
 *    `fundsArray[].cashless` からサーバが組み直す派生値で、ここから上書きすると
 *    機器ごとの内訳と食い違う（アプリも同じ理由で読み取り専用にしている）。
 */
const CashlessList = ({
  recorded,
  methods,
  perMachineMode,
  readOnly = false,
  onCommit,
  /** 合計入力モードのとき渡す。`{ amount, onCommit }` */
  cashRow,
  /** 見出しの右に出す総額。cashRow があるときだけ使う */
  total,
}) => {
  const rows = buildMethodRows(recorded, methods);
  const [saving, setSaving] = useState(false);
  /*
    まだ使っていない支払方法を出すか。
    ⚠️ **既定では畳む。** 常に並べると、現金だけの集金でも支払方法の数だけ
       ¥0 の行が並んで**どれを直せばよいのか分からなくなる。**
  */
  const [showUnused, setShowUnused] = useState(false);

  const used = rows.filter((row) => row.recorded);
  const unused = rows.filter((row) => !row.recorded);

  // 現金の行も支払方法も無い ＝ 出すものが無い
  if (!cashRow && rows.length === 0) return null;

  const commit = async (id, raw) => {
    const amount = parseInt(raw, 10);
    if (!Number.isInteger(amount) || amount < 0) return;
    if (amount === rows.find((r) => r.id === id)?.amount) return;

    setSaving(true);
    /*
      ⚠️ **全部の行を送る。** 変更した 1 件だけ送ると、サーバは
         「送られてこなかった方法＝消された」として扱うので他の内訳が消える
         （`normalizeCashless` は受け取った配列で置き換える）。
      ⚠️ 0 円は落とす。サーバも捨てるが、送らないほうが意図が伝わる。
    */
    const entries = rows
      .map((row) => ({ methodId: row.id, amount: row.id === id ? amount : row.amount }))
      .filter((entry) => entry.amount > 0);

    await onCommit(entries);
    setSaving(false);
  };

  const commitCash = async (raw) => {
    const amount = parseInt(raw, 10);
    if (!Number.isInteger(amount)) return;
    if (amount === cashRow.amount) return;
    setSaving(true);
    await cashRow.onCommit(amount);
    setSaving(false);
  };

  return (
    <Box mt={cashRow ? 0 : 6} mb={6} p={5} borderRadius="xl" border="1px solid" borderColor="cyan.100">
      {cashRow ? (
        /* ⚠️ 大きい数字はここ 1 つだけ。下の行はすべて同じ大きさに揃える */
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            集金額
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            ¥{(total ?? 0).toLocaleString()}
          </Text>
        </Box>
      ) : (
        <Flex justify="space-between" align="center" mb={1}>
          <HStack gap={2} color="var(--teal, #0891B2)">
            <Icon.LuCreditCard size={18} />
            <Text fontSize="sm" fontWeight="semibold">
              キャッシュレス
            </Text>
          </HStack>
          <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper, #155E75)">
            ¥{used.reduce((acc, row) => acc + row.amount, 0).toLocaleString()}
          </Text>
        </Flex>
      )}

      {perMachineMode && (
        <Text fontSize="xs" color="var(--text-faint, #94A3B8)" mb={4}>
          機器ごとに記録されているため、ここでは編集できません
        </Text>
      )}

      <Stack gap={1}>
        {cashRow && (
          <AmountRow
            icon={<Icon.TbCoinYenFilled size={16} />}
            label="現金"
            amount={cashRow.amount}
            readOnly={readOnly}
            disabled={saving}
            onCommit={commitCash}
          />
        )}

        {used.map((row) => (
          <AmountRow
            key={row.id}
            icon={<Icon.LuCreditCard size={15} />}
            label={row.name}
            /* ⚠️ 使用停止の方法も金額を 0 に戻せるよう並べる。ただし理由を示す */
            badge={row.retired ? "使用停止" : null}
            amount={row.amount}
            readOnly={readOnly || perMachineMode}
            disabled={saving}
            onCommit={(raw) => commit(row.id, raw)}
          />
        ))}

        {showUnused &&
          unused.map((row) => (
            <AmountRow
              key={row.id}
              icon={<Icon.LuCreditCard size={15} />}
              label={row.name}
              amount={row.amount}
              readOnly={readOnly || perMachineMode}
              disabled={saving}
              onCommit={(raw) => commit(row.id, raw)}
              muted
            />
          ))}
      </Stack>

      {/* まだ使っていない方法は畳んでおき、必要なときだけ開く */}
      {unused.length > 0 && !readOnly && !perMachineMode && (
        <Button
          onClick={() => setShowUnused((prev) => !prev)}
          variant="ghost"
          size="sm"
          mt={2}
          px={2}
          color="var(--teal, #0891B2)"
          fontWeight="semibold"
        >
          <HStack gap={1}>
            {showUnused ? <Icon.LuChevronUp size={15} /> : <Icon.LuPlus size={15} />}
            <Text fontSize="sm">
              {showUnused ? "閉じる" : `他の支払方法を入力（${unused.length}）`}
            </Text>
          </HStack>
        </Button>
      )}
    </Box>
  );
};

/**
 * 金額 1 行。現金もキャッシュレスも同じ見た目にする。
 * ⚠️ **大きさを変えないこと。** 片方だけ大きいと、そちらが総額に見える。
 */
const AmountRow = ({ icon, label, badge, amount, readOnly, disabled, onCommit, muted }) => (
  <Flex justify="space-between" align="center" gap={3} py={1} opacity={muted ? 0.65 : 1}>
    <HStack gap={2} minW={0} color={muted ? "var(--text-faint)" : "var(--teal, #0891B2)"}>
      {icon}
      <Text fontSize="sm" fontWeight="medium" color="var(--text-main, #1E3A5F)" truncate>
        {label}
      </Text>
      {badge && (
        <Badge size="sm" colorPalette="gray" flexShrink={0}>
          {badge}
        </Badge>
      )}
    </HStack>

    {readOnly ? (
      <Text
        fontSize="md"
        fontWeight="semibold"
        color="var(--text-main, #1E3A5F)"
        fontFamily="'Space Mono', monospace"
      >
        ¥{amount.toLocaleString()}
      </Text>
    ) : (
      /* ⚠️ key に金額を混ぜる。保存後に defaultValue を差し替えるため */
      <Editable.Root
        key={amount}
        defaultValue={String(amount)}
        submitMode="enter"
        onValueCommit={(e) => onCommit(e.value)}
        disabled={disabled}
      >
        <Flex align="center" justify="flex-end" gap={2}>
          <Editable.Preview
            fontWeight="semibold"
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
            fontFamily="'Space Mono', monospace"
            _hover={{ bg: "gray.100" }}
          >
            ¥{amount.toLocaleString()}
          </Editable.Preview>
          {/* ⚠️ fontSize は 16px 未満にしない。iOS Safari が入力時に拡大する */}
          <Editable.Input w="110px" textAlign="right" fontSize="16px" />
          <Editable.Control>
            <Editable.EditTrigger asChild>
              <IconButton variant="ghost" size="sm" aria-label={`${label}を編集`}>
                <Icon.LuPencilLine />
              </IconButton>
            </Editable.EditTrigger>
            <Editable.CancelTrigger asChild>
              <IconButton variant="outline" size="sm" aria-label="やめる">
                <Icon.LuX />
              </IconButton>
            </Editable.CancelTrigger>
            <Editable.SubmitTrigger asChild>
              <IconButton variant="solid" size="sm" aria-label="保存">
                <Icon.LuCheck />
              </IconButton>
            </Editable.SubmitTrigger>
          </Editable.Control>
        </Flex>
      </Editable.Root>
    )}
  </Flex>
);

export default CashlessList;
