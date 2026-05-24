# Style Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 設定ページで確立したティール系デザインシステム（CSS変数・カードスタイル・見出し色）をアプリ全ページに統一する。

**Architecture:** Chakraセマンティックトークン（`fg`/`fg.muted`）とハードコード色（`bg="white"`、`color="gray.600"`等）をCSS変数（`var(--text-main)`、`var(--card-bg)`等）に置き換える。ダークモード対応・視覚的一貫性が目的。テストなし（視覚的変更のみ）。

**Tech Stack:** Next.js App Router, Chakra UI v3, CSS Variables（`globals.css` で定義済み）

---

## 共通ルール（全タスクで参照）

| 変更前 | 変更後 |
|--------|--------|
| `color="fg"` | `color="var(--text-main)"` |
| `color="fg.muted"` | `color="var(--text-muted)"` |
| `color="gray.500"` / `color="gray.600"` (汎用テキスト) | `color="var(--text-muted)"` |
| `bg="white"` (カード・コンテナ背景) | `bg="var(--card-bg, #FFFFFF)"` |
| Card `variant="elevated"` | `bg="var(--card-bg, #FFFFFF)"` + `border="1px solid"` + `borderColor="cyan.100"` + `boxShadow="var(--shadow-sm)"` + `borderRadius="xl"` |
| `borderColor="gray.200"` (カードボーダー) | `borderColor="cyan.100"` |
| ページ・セクション見出し（色なし） | `color="var(--teal-deeper)"` 追加 |

---

### Task 1: 認証コンポーネント（3ファイル）

**Files:**
- Modify: `src/app/feacher/auth/components/AuthForm/AuthForm.jsx`
- Modify: `src/app/feacher/auth/components/ForgetPassword/ForgetPassword.jsx`
- Modify: `src/app/feacher/auth/components/UpdataPassword/UpdatePassword.jsx`

- [ ] **Step 1: AuthForm.jsx を修正する**

`Card.Body` と `Card.Footer` の `bg="white"` を `bg="var(--card-bg, #FFFFFF)"` に変更する。

変更箇所 1（Card.Body, line 61）:
```jsx
<Card.Body py={8} px={6} bg="var(--card-bg, #FFFFFF)">
```

変更箇所 2（Card.Footer, line 145）:
```jsx
<Card.Footer flexDirection="column" gap={4} px={6} pb={6} bg="var(--card-bg, #FFFFFF)">
```

- [ ] **Step 2: ForgetPassword.jsx を修正する**

`Card.Root` の `bg="white"` と `Input` の `bg="white"` を変更する。

変更箇所 1（Card.Root, line 34）:
```jsx
<Card.Root
  bg="var(--card-bg, #FFFFFF)"
  borderRadius="2xl"
  boxShadow="0 12px 40px rgba(14, 116, 144, 0.18)"
  overflow="hidden"
  border="1px solid rgba(8, 145, 178, 0.12)"
>
```

変更箇所 2（Input, line 98-122）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Input
  id="email"
  name="email"
  type="email"
  placeholder="example@email.com"
  required
  border="1.5px solid"
  borderColor="var(--divider, #F1F5F9)"
  borderRadius="lg"
  py={3}
  px={4}
  fontSize="md"
  bg="var(--card-bg, #FFFFFF)"
  color="var(--text-main, #1E3A5F)"
  transition="all 0.2s"
  _focus={{
    borderColor: "cyan.500",
    boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
    outline: "none",
  }}
  _placeholder={{
    color: "var(--text-faint, #94A3B8)",
  }}
/>
```

- [ ] **Step 3: UpdatePassword.jsx を修正する**

`Card.Root` の `bg="white"` と `Input` の `bg="white"` を変更する。

変更箇所 1（Card.Root, line 31）:
```jsx
<Card.Root
  bg="var(--card-bg, #FFFFFF)"
  borderRadius="2xl"
  boxShadow="0 12px 40px rgba(14, 116, 144, 0.18)"
  overflow="hidden"
  border="1px solid rgba(8, 145, 178, 0.12)"
>
```

変更箇所 2（Input, line 90-114）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Input
  id="password"
  name="password"
  type={showPassword ? "text" : "password"}
  placeholder="新しいパスワード"
  required
  border="1.5px solid"
  borderColor="var(--divider, #F1F5F9)"
  borderRadius="lg"
  py={3}
  px={4}
  pr={12}
  fontSize="md"
  bg="var(--card-bg, #FFFFFF)"
  color="var(--text-main, #1E3A5F)"
  transition="all 0.2s"
  _focus={{
    borderColor: "cyan.500",
    boxShadow: "0 0 0 2px rgba(8, 145, 178, 0.20)",
    outline: "none",
  }}
  _placeholder={{
    color: "var(--text-faint, #94A3B8)",
  }}
/>
```

- [ ] **Step 4: コミット**

```bash
git add src/app/feacher/auth/components/AuthForm/AuthForm.jsx src/app/feacher/auth/components/ForgetPassword/ForgetPassword.jsx src/app/feacher/auth/components/UpdataPassword/UpdatePassword.jsx
git commit -m "style: apply card-bg CSS variable to auth components"
```

---

### Task 2: 店舗一覧（CoinLaundryClientPage）

**Files:**
- Modify: `src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx`

- [ ] **Step 1: 空状態コンポーネントの bg を修正する**

`EmptyStoresState` と `NoResultsState` の `bg="white"` を `bg="var(--card-bg, #FFFFFF)"` に変更する。

変更後（lines 9-28）:
```jsx
const EmptyStoresState = () => (
  <Box bg="var(--card-bg, #FFFFFF)" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      右下のボタンから新しい店舗を追加できます
    </Text>
  </Box>
);

const NoResultsState = ({ query }) => (
  <Box bg="var(--card-bg, #FFFFFF)" p={12} borderRadius="18px" textAlign="center" boxShadow="var(--shadow-sm)">
    <Heading size="lg" color="var(--text-muted, #64748B)" fontWeight="medium" mb={2}>
      「{query}」に一致する店舗がありません
    </Heading>
    <Text color="var(--text-faint, #94A3B8)" fontSize="sm">
      別のキーワードで検索してみてください
    </Text>
  </Box>
);
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx
git commit -m "style: use card-bg CSS variable in store list empty states"
```

---

### Task 3: 店舗詳細 — MonoCard

**Files:**
- Modify: `src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoCard.jsx`

- [ ] **Step 1: fg / fg.muted をCSS変数に置き換える**

現在のMonoCard.jsx（lines 33-57）の `color="fg"` と `color="fg.muted"` を変更する:

```jsx
<VStack align="stretch" gap={6}>
  <Heading
    fontSize={{ base: "2xl", md: "3xl" }}
    fontWeight="bold"
    color="var(--text-main)"
    letterSpacing="tight"
  >
    {coinLaundry.store}店
  </Heading>

  <HStack color="var(--text-muted)" fontSize="sm" fontWeight="semibold">
    <Icon.PiMapPin size={18} />
    <Text>{coinLaundry.location}</Text>
  </HStack>

  {coinLaundry.description && (
    <Text
      fontSize="md"
      lineHeight="tall"
      color="var(--text-muted)"
      whiteSpace="pre-wrap"
    >
      {coinLaundry.description}
    </Text>
  )}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoCard.jsx
git commit -m "style: replace fg/fg.muted with CSS variables in MonoCard"
```

---

### Task 4: 店舗詳細 — MonoDataTotal

**Files:**
- Modify: `src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoDataTotal.jsx`

- [ ] **Step 1: ファイル全体を書き換える**

`bg="white"` → `var(--card-bg)`、`borderColor="gray.200"` → `cyan.100`、`color="green.700"` → `var(--teal-deeper)`、`color="gray.*"` → CSS変数に統一。ファイル全体を以下に置き換える:

```jsx
import { getFundsData } from "@/app/api/supabaseFunctions/supabaseDatabase/collectFunds/action";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";
import Link from "next/link";

const MonoDataTotal = async ({ coinLaundry }) => {
  const { data, error } = await getFundsData(coinLaundry.id);

  if (error)
    return (
      <Text fontSize="sm" color="red.500" fontWeight="medium">
        データを入手できませんでした
      </Text>
    );

  if (!data || data.length === 0) {
    return (
      <VStack align="stretch" gap={1}>
        <Text fontSize="2xl" fontWeight="bold" color="var(--teal-deeper)">
          ¥0
        </Text>
        <Text fontSize="xs" color="var(--text-muted)">
          集金データがありません
        </Text>
      </VStack>
    );
  }

  const totalRevenue = data.reduce((accumulator, current) => {
    const summary = current.totalFunds;
    return accumulator + summary;
  }, 0);

  return (
    <Box
      bg="var(--card-bg, #FFFFFF)"
      p={{ base: 5, md: 6 }}
      borderRadius="xl"
      border="1px solid"
      borderColor="cyan.100"
      boxShadow="var(--shadow-sm)"
    >
      <VStack align="stretch" gap={3}>
        <Text fontSize="sm" fontWeight="semibold" color="var(--text-muted)">
          総売上
        </Text>
        <VStack align="stretch" gap={1}>
          <Text fontSize="3xl" fontWeight="bold" color="var(--teal-deeper)">
            ¥{totalRevenue.toLocaleString()}
          </Text>
          <Text fontSize="xs" color="var(--text-muted)">
            累計 {data.length}回の集金
          </Text>
          <Link href={`/coinLaundry/${coinLaundry.id}/coinDataList`}>
            <Button
              fontSize="xs"
              variant="outline"
              color="var(--teal, #0891B2)"
              borderColor="rgba(8,145,178,0.30)"
              _hover={{
                bg: "var(--teal-pale)",
                borderColor: "var(--teal, #0891B2)",
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
            >
              <Icon.VscGraphLine />
              収益レポートへ
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
};

export default MonoDataTotal;
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/coinLandry/components/MonoCoinLaundry/MonoDataTotal.jsx
git commit -m "style: unify MonoDataTotal colors to CSS variables"
```

---

### Task 5: 店舗詳細 — HaveMachines & NowLaundryNum

**Files:**
- Modify: `src/app/feacher/coinLandry/components/MonoCoinLaundry/HaveMachines.jsx`
- Modify: `src/app/feacher/coinLandry/components/NowLaundryNum.jsx`

- [ ] **Step 1: HaveMachines.jsx のトリガーカードと機器アイテムのbgを修正する**

変更箇所 1 — Drawer.Trigger 内 Box（line 18-21）:
```jsx
<Box
  bg="var(--card-bg, #FFFFFF)"
  p={{ base: 5, md: 6 }}
  borderRadius="xl"
  border="2px solid"
  borderColor="var(--divider, #F1F5F9)"
  boxShadow="var(--shadow-sm)"
  cursor="pointer"
  transition="all 0.2s"
  _hover={{ borderColor: "cyan.300", boxShadow: "0 4px 16px rgba(8,145,178,0.12)" }}
>
```

変更箇所 2 — Drawer.Body 内 machine アイテム（line 91-104）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Box
  key={machine.id}
  p={4}
  bg="var(--card-bg, #FFFFFF)"
  borderRadius="14px"
  borderLeft="4px solid"
  borderColor="var(--teal, #0891B2)"
  boxShadow="var(--shadow-sm)"
  transition="all 0.2s"
  _hover={{
    bg: "cyan.50",
    transform: "translateX(4px)",
    boxShadow: "0 4px 16px rgba(8,145,178,0.12)",
  }}
>
```

- [ ] **Step 2: NowLaundryNum.jsx のダイアログ内 bg を修正する**

変更箇所 1 — Dialog.Content（line 149-153）:
```jsx
<Dialog.Content
  borderRadius="16px"
  maxW="md"
  bg="var(--card-bg, #FFFFFF)"
  boxShadow="xl"
>
```

変更箇所 2 — Dialog.Header（line 155-163）— `bg="cyan.50"` → `bg="var(--teal-pale)"`:
```jsx
<Dialog.Header
  bg="var(--teal-pale)"
  borderBottom="1px solid"
  borderColor="cyan.200"
  p={6}
>
  <Dialog.Title fontSize="xl" fontWeight="bold" color="cyan.900">
    在庫管理({data.laundryName}店)
  </Dialog.Title>
</Dialog.Header>
```

変更箇所 3 — 洗剤カウンター表示 Box（line 195-204）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Box
  bg="var(--card-bg, #FFFFFF)"
  px={8}
  py={4}
  borderRadius="lg"
  border="2px solid"
  minW="100px"
  textAlign="center"
>
```

変更箇所 4 — 柔軟剤カウンター表示 Box（line 243-250）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Box
  bg="var(--card-bg, #FFFFFF)"
  px={8}
  py={4}
  borderRadius="lg"
  border="2px solid"
  minW="100px"
  textAlign="center"
>
```

- [ ] **Step 3: コミット**

```bash
git add src/app/feacher/coinLandry/components/MonoCoinLaundry/HaveMachines.jsx src/app/feacher/coinLandry/components/NowLaundryNum.jsx
git commit -m "style: replace white bg with card-bg CSS variable in HaveMachines and NowLaundryNum"
```

---

### Task 6: 収益レポート — CoinDataList

**Files:**
- Modify: `src/app/feacher/collectMoney/components/coinDataList/CoinDataList.jsx`

- [ ] **Step 1: 見出しにティール色を追加する**

変更箇所 1 — 「収益レポート」見出し（line 71-78）:
```jsx
<Heading
  size={{ base: "xl", md: "2xl" }}
  fontWeight="bold"
  letterSpacing="tight"
  color="var(--teal-deeper)"
>
  {valiant === "aStore" && `${coinLaundry.store}店`}
  {valiant === "manyStore" && `収益レポート`}
</Heading>
```

変更箇所 2 — 「売上履歴」見出し（line 193）:
```jsx
<Heading color="var(--teal-deeper)">売上履歴</Heading>
```

- [ ] **Step 2: Card の variant="elevated" を明示スタイルに置き換える**

変更箇所 1 — 集金総額カード（line 111-112）:
```jsx
<Card.Root
  borderRadius="xl"
  bg="var(--card-bg, #FFFFFF)"
  border="1px solid"
  borderColor="cyan.100"
  boxShadow="var(--shadow-sm)"
>
```

変更箇所 2 — チャートカード（line 177-178）:
```jsx
<Card.Root
  borderRadius="xl"
  bg="var(--card-bg, #FFFFFF)"
  border="1px solid"
  borderColor="cyan.100"
  boxShadow="var(--shadow-sm)"
>
```

- [ ] **Step 3: fg / fg.muted をCSS変数に置き換える**

「集金総額」ラベル（line 116-122）:
```jsx
<Text
  fontSize="xs"
  fontWeight="semibold"
  color="var(--text-muted)"
  textTransform="uppercase"
  letterSpacing="widest"
>
  集金総額
</Text>
```

日付範囲テキスト（line 123-129）:
```jsx
{data && data.length > 0 && (
  <Text fontSize="xs" color="var(--text-muted)">
    {createNowData(data[0].date)} 〜{" "}
    {createNowData(data[data.length - 1].date)}
  </Text>
)}
```

¥ 記号（line 133-137）:
```jsx
<Text
  fontSize={{ base: "xl", md: "2xl" }}
  fontWeight="semibold"
  color="var(--text-muted)"
>
  ¥
</Text>
```

金額数値（line 140-147）:
```jsx
<Text
  fontSize={{ base: "5xl", md: "7xl" }}
  fontWeight="black"
  lineHeight="1"
  letterSpacing="tight"
  color="var(--text-main)"
>
  {totalRevenue.toLocaleString()}
</Text>
```

「円」テキスト（line 152-159）:
```jsx
<Text
  fontSize={{ base: "lg", md: "xl" }}
  fontWeight="medium"
  color="var(--text-muted)"
  alignSelf="flex-end"
  pb={1}
>
  円
</Text>
```

「累計N回の集金」テキスト（line 163-169）:
```jsx
{data && (
  <Text fontSize="sm" color="var(--text-muted)">
    累計{" "}
    <Text as="span" fontWeight="bold" color="var(--text-main)">
      {data.length}
    </Text>{" "}
    回の集金
  </Text>
)}
```

- [ ] **Step 4: コミット**

```bash
git add src/app/feacher/collectMoney/components/coinDataList/CoinDataList.jsx
git commit -m "style: unify CoinDataList colors — teal headings, CSS var text, explicit card style"
```

---

### Task 7: 集金フォーム

**Files:**
- Modify: `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm.jsx`
- Modify: `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyHeader.jsx`
- Modify: `src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyFooter.jsx`
- Modify: `src/app/feacher/collectMoney/components/collectMoneyForm/CardContext/MachineAndMoney.jsx`

- [ ] **Step 1: CollectMoneyForm.jsx — メイン背景を修正する**

変更箇所（line 57）— `bg="white"` → `bg="var(--app-bg, #F0F9FF)"`:
```jsx
<VStack spacing={0} minH="100vh" bg="var(--app-bg, #F0F9FF)">
```

- [ ] **Step 2: CollectMoneyHeader.jsx — ヘッダー背景を修正する**

変更箇所（line 6-10）:
```jsx
<Box
  py={{ base: 4, md: 6 }}
  px={{ base: 4, md: 8 }}
  w="full"
  bg="var(--card-bg, #FFFFFF)"
  position="fixed"
  top="0"
  zIndex="1400"
  borderBottomWidth="1px"
  borderBottomColor="var(--divider, #F1F5F9)"
  shadow="sm"
>
```

- [ ] **Step 3: CollectMoneyFooter.jsx — フッター・ボタン背景を修正する**

変更箇所 1 — フッター HStack（line 24-28）:
```jsx
<HStack
  py={{ base: 4, md: 6 }}
  px={{ base: 4, md: 8 }}
  w="full"
  bg="var(--card-bg, #FFFFFF)"
  position="fixed"
  bottom="0"
  zIndex="1400"
  borderTopWidth="1px"
  borderTopColor="var(--divider, #F1F5F9)"
  shadow="lg"
  gap={{ base: 3, md: 4 }}
  justify="space-between"
  flexWrap={{ base: "wrap", sm: "nowrap" }}
>
```

変更箇所 2 — キャンセルボタン（line 59-80）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Button
  onClick={onCancel}
  variant="outline"
  size="lg"
  bg="var(--card-bg, #FFFFFF)"
  color="var(--text-muted, #64748B)"
  fontWeight="semibold"
  px={{ base: 6, md: 8 }}
  borderWidth="2px"
  borderColor="var(--divider, #F1F5F9)"
  borderRadius="xl"
  flex={{ base: 1, sm: "unset" }}
  _hover={{
    bg: "var(--app-bg, #F0F9FF)",
    borderColor: "cyan.200",
    transform: "translateY(-1px)",
  }}
  _active={{ transform: "translateY(0)" }}
  transition="all 0.2s"
>
  キャンセル
</Button>
```

変更箇所 3 — 一時保存ボタン（line 83-104）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Button
  onClick={onSaveDraft}
  variant="outline"
  size="lg"
  bg="var(--card-bg, #FFFFFF)"
  color="amber.600"
  fontWeight="semibold"
  px={{ base: 4, md: 6 }}
  borderWidth="2px"
  borderColor="amber.400"
  borderRadius="xl"
  flex={{ base: 1, sm: "unset" }}
  _hover={{
    bg: "amber.50",
    borderColor: "amber.500",
    transform: "translateY(-1px)",
  }}
  _active={{ transform: "translateY(0)" }}
  transition="all 0.2s"
>
  一時保存
</Button>
```

- [ ] **Step 4: MachineAndMoney.jsx — トグルボタン背景を修正する**

変更箇所（line 76-90）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Button
  borderRadius="full"
  variant="outline"
  size="sm"
  p={2}
  minW="auto"
  h="auto"
  borderWidth="1.5px"
  borderColor="cyan.200"
  color="var(--teal, #0891B2)"
  bg="var(--card-bg, #FFFFFF)"
  onClick={(e) => hander(machineAndFunds.machine.name, "toggle", e)}
  _active={{ borderColor: "cyan.400", bg: "cyan.50", transform: "rotate(180deg)" }}
  transition="all 0.3s"
>
  <LuRefreshCw size={16} />
</Button>
```

- [ ] **Step 5: コミット**

```bash
git add src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyForm.jsx src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyHeader.jsx src/app/feacher/collectMoney/components/collectMoneyForm/CollectMoneyFooter.jsx src/app/feacher/collectMoney/components/collectMoneyForm/CardContext/MachineAndMoney.jsx
git commit -m "style: apply CSS variable bg colors to collect money form components"
```

---

### Task 8: 店舗登録・編集フォーム

**Files:**
- Modify: `src/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm.jsx`

- [ ] **Step 1: フォームカード・ボタンの bg を修正する**

変更箇所 1 — メインカード Box（line 64-70）:
```jsx
<Box
  bg="var(--card-bg, #FFFFFF)"
  borderRadius="2xl"
  boxShadow="var(--shadow-sm)"
  overflow="hidden"
  border="1px solid rgba(8, 145, 178, 0.10)"
>
```

変更箇所 2 — Drawer CloseButton（line 231-239）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<CloseButton
  position="absolute"
  top={4}
  right={4}
  bg="var(--card-bg, #FFFFFF)"
  borderRadius="full"
  boxShadow="sm"
  _hover={{ bg: "cyan.50", transform: "scale(1.1)" }}
  transition="all 0.2s"
/>
```

変更箇所 3 — キャンセルボタン（line 272-285）— `bg="white"` → `bg="var(--card-bg, #FFFFFF)"`:
```jsx
<Button
  variant="outline"
  w={{ base: "full", md: "auto" }}
  minW={{ md: "120px" }}
  fontWeight="semibold"
  borderRadius="lg"
  border="1.5px solid"
  borderColor="var(--divider, #F1F5F9)"
  bg="var(--card-bg, #FFFFFF)"
  color="var(--text-muted, #64748B)"
  transition="all 0.2s"
  _hover={{ bg: "var(--app-bg, #F0F9FF)", borderColor: "cyan.200" }}
>
  キャンセル
</Button>
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/coinLandry/components/CoinLaundryForm/CoinLaundryForm.jsx
git commit -m "style: apply card-bg CSS variable to CoinLaundryForm"
```

---

## 動作確認チェックリスト

- [ ] ライトモードで全ページが正常に表示される（認証・店舗一覧・店舗詳細・収益・集金フォーム）
- [ ] ダークモード切替後、全ページの背景・テキスト・カードが適切に変化する
- [ ] 在庫管理ダイアログの機器状態カラー（cyan/orange）が維持されている
- [ ] 集金フォームの入力・一時保存・送信が正常に動作する
- [ ] 認証フォームのログイン・サインアップが正常に動作する
