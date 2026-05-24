# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/account` を `/settings` に置き換え、アカウント情報・組織情報の閲覧と編集、集金方法・ダークモード設定を提供するページ群を実装する。

**Architecture:** `/settings` がメインの閲覧ページ（Server Component）で各情報カードを表示する。編集は `/settings/account/edit`・`/settings/organization/edit` のサブルートで行う。ダークモードは CSS 変数オーバーライドと `localStorage` で実現し、集金方法は既存 Supabase Server Action で即時更新する。旧 `/account` と `/account/log` はリダイレクトに変換する。

**Tech Stack:** Next.js App Router (RSC + Client Components), Chakra UI v3, Supabase Server Actions, localStorage for dark mode

---

## ファイル構成

### 新規作成
- `src/app/settings/page.jsx` — メイン設定ページ（Server Component）
- `src/app/settings/loading.jsx` — ローディング表示
- `src/app/settings/account/edit/page.jsx` — アカウント編集ページ
- `src/app/settings/organization/edit/page.jsx` — 組織管理ページ（admin only）
- `src/app/settings/log/page.jsx` — アクションログページ
- `src/app/feacher/settings/components/AccountInfoCard.jsx` — アカウント情報表示カード
- `src/app/feacher/settings/components/OrgInfoCard.jsx` — 組織情報表示カード
- `src/app/feacher/settings/components/AppSettingsCard.jsx` — アプリ設定カード（集金方法・ダークモード）
- `src/app/feacher/settings/components/OtherActionsCard.jsx` — ログリンク・サインアウトカード
- `src/app/feacher/settings/components/CollectMethodSetting.jsx` — 集金方法 Client Component
- `src/app/feacher/settings/components/DarkModeSetting.jsx` — ダークモード Client Component
- `src/app/feacher/settings/components/AccountEditForm.jsx` — アカウント編集フォーム Client Component

### 変更
- `src/app/feacher/Icon.js` — 新アイコン追加（LuSettings, LuSun, LuMoon, LuBuilding2）
- `src/app/api/supabaseFunctions/supabaseDatabase/profiles/action.js` — getProfile に collectMethod 追加、setCollectMethod 関数追加
- `src/app/globals.css` — ダークモード CSS 変数追加
- `src/app/layout.js` — フラッシュ防止インラインスクリプト追加
- `src/app/feacher/account/components/accountForm/useUserProfile.js` — onSuccess コールバック対応
- `src/app/account/page.jsx` — /settings へリダイレクト
- `src/app/account/log/page.jsx` — /settings/log へリダイレクト
- `src/app/feacher/partials/FooterNavbar/FooterNavber.jsx` — /account → /settings、アイコン更新
- `src/app/feacher/partials/Navber/Navbar.jsx` — /account → /settings

---

### Task 1: Foundation — アイコン追加・DB アクション更新・ダークモード CSS

**Files:**
- Modify: `src/app/feacher/Icon.js`
- Modify: `src/app/api/supabaseFunctions/supabaseDatabase/profiles/action.js`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.js`

- [ ] **Step 1: Icon.js に新アイコンを追加する**

`src/app/feacher/Icon.js` の `react-icons/lu` import にアイコンを追記し、export に追加する。

```js
// react-icons/lu import に追加（既存 LuPencil の後）
  LuSettings,
  LuSun,
  LuMoon,
  LuBuilding2,

// export ブロックに追加
  LuSettings,
  LuSun,
  LuMoon,
  LuBuilding2,
```

- [ ] **Step 2: profiles/action.js を更新する**

`getProfile` の `.select()` を変更し、末尾に `setCollectMethod` 関数を追加する。

```js
// getProfile の select を変更
.select("full_name, username, role, collectMethod")

// ファイル末尾に追加
export const setCollectMethod = async (value) => {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ collectMethod: value })
    .eq("id", user.id);

  return { error };
};
```

- [ ] **Step 3: globals.css にダークモード CSS 変数を追加する**

`src/app/globals.css` の末尾に追加：

```css
[data-theme="dark"] {
  --background: #0F172A;
  --foreground: #E2E8F0;
  --app-bg:      #0F172A;
  --card-bg:     #1E293B;
  --text-main:   #E2E8F0;
  --text-muted:  #94A3B8;
  --text-faint:  #475569;
  --divider:     #334155;
  --teal:        #22D3EE;
  --teal-dark:   #06B6D4;
  --teal-deeper: #67E8F9;
  --teal-pale:   rgba(8, 145, 178, 0.15);
  --shadow-sm:   0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-hero: 0 12px 40px rgba(0, 0, 0, 0.6);
}
```

- [ ] **Step 4: layout.js にフラッシュ防止スクリプトを追加する**

`src/app/layout.js` の `<html>` の直後に `<head>` ブロックを追加する：

```jsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('colorMode');if(m==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
  </head>
  <body>
    {/* 既存の body の内容はそのまま */}
  </body>
</html>
```

- [ ] **Step 5: コミット**

```bash
git add src/app/feacher/Icon.js src/app/api/supabaseFunctions/supabaseDatabase/profiles/action.js src/app/globals.css src/app/layout.js
git commit -m "feat(settings): foundation — icons, setCollectMethod action, dark mode CSS"
```

---

### Task 2: CollectMethodSetting クライアントコンポーネント

**Files:**
- Create: `src/app/feacher/settings/components/CollectMethodSetting.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
"use client";

import { useState } from "react";
import { RadioCard, HStack, Text, VStack } from "@chakra-ui/react";
import { setCollectMethod } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { showToast } from "@/functions/makeToast/toast";

const ITEMS = [
  { value: "machines", label: "機械別集金", description: "各機械の収益を個別に記録" },
  { value: "total",    label: "まとめて集金", description: "総額のみを記録" },
];

export default function CollectMethodSetting({ defaultValue }) {
  const [value, setValue] = useState(defaultValue || "machines");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const next = e.value;
    setValue(next);
    setLoading(true);
    const { error } = await setCollectMethod(next);
    setLoading(false);
    if (error) {
      showToast("error", "集金方法の更新に失敗しました");
    } else {
      showToast("success", "集金方法を更新しました");
    }
  };

  return (
    <RadioCard.Root value={value} onValueChange={handleChange} size="sm" disabled={loading}>
      <HStack gap={3} align="stretch">
        {ITEMS.map((item) => (
          <RadioCard.Item
            key={item.value}
            value={item.value}
            flex={1}
            borderRadius="lg"
            border="2px solid"
            borderColor={value === item.value ? "cyan.300" : "cyan.100"}
            bg={value === item.value ? "var(--teal-pale)" : "transparent"}
            cursor="pointer"
            transition="all 0.2s"
          >
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl p={3}>
              <RadioCard.ItemContent>
                <VStack align="start" gap={0.5}>
                  <RadioCard.ItemText fontSize="sm" fontWeight="bold" color="var(--text-main)">
                    {item.label}
                  </RadioCard.ItemText>
                  <Text fontSize="xs" color="var(--text-muted)" lineHeight="1.4">
                    {item.description}
                  </Text>
                </VStack>
              </RadioCard.ItemContent>
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
      </HStack>
    </RadioCard.Root>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/CollectMethodSetting.jsx
git commit -m "feat(settings): CollectMethodSetting client component"
```

---

### Task 3: DarkModeSetting クライアントコンポーネント

**Files:**
- Create: `src/app/feacher/settings/components/DarkModeSetting.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
"use client";

import { useEffect, useState } from "react";
import { Switch, HStack } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

export default function DarkModeSetting() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("colorMode");
    setIsDark(stored === "dark");
  }, []);

  const handleToggle = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("colorMode", theme);
  };

  return (
    <HStack gap={2}>
      <Icon.LuSun size={16} color="var(--text-muted)" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        colorPalette="cyan"
        size="md"
      />
      <Icon.LuMoon size={16} color="var(--text-muted)" />
    </HStack>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/DarkModeSetting.jsx
git commit -m "feat(settings): DarkModeSetting client component"
```

---

### Task 4: AccountInfoCard コンポーネント（読み取り専用）

**Files:**
- Create: `src/app/feacher/settings/components/AccountInfoCard.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
import { Card, VStack, HStack, Text, Box, Flex, Heading, Badge } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

const ROLE_LABEL = {
  admin:     "店舗管理者",
  collecter: "集金担当者",
  viewer:    "閲覧者",
};

function InfoRow({ icon, label, value }) {
  return (
    <HStack gap={3} py={3} borderBottom="1px solid" borderColor="var(--divider)">
      <Flex
        w="36px" h="36px"
        bg="var(--teal-pale)"
        borderRadius="lg"
        align="center" justify="center"
        color="var(--teal)"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" color="var(--text-muted)" mb={0.5}>{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)"
          overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
          {value || "—"}
        </Text>
      </Box>
    </HStack>
  );
}

export default function AccountInfoCard({ user, profile, myRole }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            アカウント
          </Heading>
          <Link href="/settings/account/edit">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuPencil size={14} />
              <Text>編集</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={0}>
          <InfoRow icon={<Icon.LuMail size={16} />}   label="メールアドレス" value={user?.email} />
          <InfoRow icon={<Icon.LuUser size={16} />}   label="氏名"           value={profile?.full_name} />
          <InfoRow icon={<Icon.LuAtSign size={16} />} label="ユーザー名"     value={profile?.username} />
          <HStack gap={3} py={3}>
            <Flex w="36px" h="36px" bg="var(--teal-pale)" borderRadius="lg"
              align="center" justify="center" color="var(--teal)" flexShrink={0}>
              <Icon.LuCrown size={16} />
            </Flex>
            <Box>
              <Text fontSize="xs" color="var(--text-muted)" mb={0.5}>役割</Text>
              <Badge bg="var(--teal-pale)" color="var(--teal-deeper)"
                px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
                {ROLE_LABEL[myRole] ?? "閲覧者"}
              </Badge>
            </Box>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/AccountInfoCard.jsx
git commit -m "feat(settings): AccountInfoCard display component"
```

---

### Task 5: OrgInfoCard コンポーネント（読み取り専用）

**Files:**
- Create: `src/app/feacher/settings/components/OrgInfoCard.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
import { Card, HStack, Text, Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export default function OrgInfoCard({ org }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            組織
          </Heading>
          <Link href="/settings/organization/edit">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuSettings size={14} />
              <Text>管理</Text>
            </HStack>
          </Link>
        </HStack>

        <HStack gap={3} p={4} bg="var(--teal-pale)" borderRadius="lg"
          border="1px solid" borderColor="cyan.100">
          <Flex w="40px" h="40px" bg="var(--card-bg, white)" borderRadius="lg"
            align="center" justify="center" color="var(--teal)"
            flexShrink={0} boxShadow="var(--shadow-sm)">
            <Icon.LuBuilding2 size={20} />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">{org?.name}</Text>
            <Text fontSize="xs" color="var(--text-muted)">組織名</Text>
          </Box>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/OrgInfoCard.jsx
git commit -m "feat(settings): OrgInfoCard display component"
```

---

### Task 6: AppSettingsCard コンポーネント

**Files:**
- Create: `src/app/feacher/settings/components/AppSettingsCard.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
import { Card, VStack, HStack, Text, Box, Heading, Separator } from "@chakra-ui/react";
import CollectMethodSetting from "./CollectMethodSetting";
import DarkModeSetting from "./DarkModeSetting";
import * as Icon from "@/app/feacher/Icon";

function SettingRow({ icon, label, description, control }) {
  return (
    <HStack justify="space-between" align="start" gap={4}>
      <HStack gap={2.5} align="start" flex={1}>
        <Box color="var(--teal)" pt={0.5} flexShrink={0}>{icon}</Box>
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">{label}</Text>
          {description && (
            <Text fontSize="xs" color="var(--text-muted)">{description}</Text>
          )}
        </Box>
      </HStack>
      {control && <Box flexShrink={0}>{control}</Box>}
    </HStack>
  );
}

export default function AppSettingsCard({ collectMethod }) {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          アプリ設定
        </Heading>
        <VStack align="stretch" gap={5}>
          <SettingRow
            icon={<Icon.BiCoinStack size={16} />}
            label="集金方法"
            description="機械別に記録するか、まとめて記録するか"
          />
          <CollectMethodSetting defaultValue={collectMethod} />

          <Separator borderColor="var(--divider)" />

          <SettingRow
            icon={<Icon.LuMoon size={16} />}
            label="ダークモード"
            description="画面の配色を暗くする"
            control={<DarkModeSetting />}
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/AppSettingsCard.jsx
git commit -m "feat(settings): AppSettingsCard with collect method and dark mode"
```

---

### Task 7: OtherActionsCard コンポーネント

**Files:**
- Create: `src/app/feacher/settings/components/OtherActionsCard.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
import { Card, Button, HStack, Text, Box, Flex, Heading, VStack } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";

export default function OtherActionsCard() {
  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 5, md: 6 }}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)" mb={5}>
          その他
        </Heading>
        <VStack align="stretch" gap={3}>
          <Link href="/settings/log">
            <HStack
              justify="space-between" p={4}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <HStack gap={3}>
                <Flex w="40px" h="40px" bg="var(--teal-pale)" borderRadius="lg"
                  align="center" justify="center" color="var(--teal)">
                  <Icon.LuHistory size={20} />
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">アクションログ</Text>
                  <Text fontSize="xs" color="var(--text-muted)">操作履歴を確認できます</Text>
                </Box>
              </HStack>
              <Icon.LuChevronRight color="var(--text-faint)" />
            </HStack>
          </Link>

          <form action="/api/auth/logout" method="post">
            <Button
              type="submit" w="full" py={3.5} px={6}
              fontSize="md" fontWeight="semibold"
              bg="white" color="red.500"
              border="2px solid" borderColor="red.400"
              borderRadius="lg" cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "red.50" }} _active={{ bg: "red.100" }}
            >
              サインアウト
            </Button>
          </form>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/feacher/settings/components/OtherActionsCard.jsx
git commit -m "feat(settings): OtherActionsCard with log link and sign-out"
```

---

### Task 8: メイン設定ページ

**Files:**
- Create: `src/app/settings/page.jsx`
- Create: `src/app/settings/loading.jsx`

- [ ] **Step 1: loading.jsx を作成する**

```jsx
import { Box, VStack, Skeleton } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <VStack align="stretch" gap={4}>
        <Skeleton h="32px" w="120px" borderRadius="lg" mb={2} />
        <Skeleton h="220px" borderRadius="xl" />
        <Skeleton h="130px" borderRadius="xl" />
        <Skeleton h="200px" borderRadius="xl" />
        <Skeleton h="160px" borderRadius="xl" />
      </VStack>
    </Box>
  );
}
```

- [ ] **Step 2: page.jsx を作成する**

```jsx
export const dynamic = "force-dynamic";

import { Box, VStack, HStack, Heading } from "@chakra-ui/react";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import AccountInfoCard from "@/app/feacher/settings/components/AccountInfoCard";
import OrgInfoCard from "@/app/feacher/settings/components/OrgInfoCard";
import AppSettingsCard from "@/app/feacher/settings/components/AppSettingsCard";
import OtherActionsCard from "@/app/feacher/settings/components/OtherActionsCard";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsPage() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
  ]);

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack gap={3} mb={6}>
        <Icon.LuSettings size={24} color="var(--teal)" />
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          設定
        </Heading>
      </HStack>

      <VStack align="stretch" gap={4}>
        <AccountInfoCard user={user} profile={profile} myRole={org?.myRole} />
        {org?.myRole === "admin" && <OrgInfoCard org={org} />}
        <AppSettingsCard collectMethod={profile?.collectMethod} />
        <OtherActionsCard />
      </VStack>
    </Box>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add src/app/settings/page.jsx src/app/settings/loading.jsx
git commit -m "feat(settings): main settings page assembling all cards"
```

---

### Task 9: アカウント編集ページ

**Files:**
- Modify: `src/app/feacher/account/components/accountForm/useUserProfile.js`
- Create: `src/app/feacher/settings/components/AccountEditForm.jsx`
- Create: `src/app/settings/account/edit/page.jsx`

- [ ] **Step 1: useUserProfile.js を onSuccess コールバック対応に更新する**

関数シグネチャを `{ onSuccess } = {}` 引数追加に変更し、`handleUpdate` の成功時に `onSuccess?.()` を呼ぶ：

```js
export function useUserProfile({ onSuccess } = {}) {
  // state 定義はそのまま

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await updateProfile({ fullname, username });
    if (error) {
      showToast("error", "プロフィールを更新に失敗しました");
    } else {
      await showToast("success", "プロフィールを更新しました");
      onSuccess?.();
    }
    setLoading(false);
  };

  // return はそのまま
}
```

既存の `AccountForm.jsx` の呼び出し `useUserProfile()` は引数なしのため、オプショナル引数なので変更不要。

- [ ] **Step 2: AccountEditForm.jsx を作成する**

```jsx
"use client";

import { Box, Button, Card, Field, Input, VStack, Heading, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/app/feacher/account/components/accountForm/useUserProfile";
import * as Icon from "@/app/feacher/Icon";

export default function AccountEditForm() {
  const router = useRouter();
  const { loading, fullname, username, setFullname, setUsername, handleUpdate } =
    useUserProfile({ onSuccess: () => router.push("/settings") });

  return (
    <Card.Root w="full" bg="var(--card-bg, #FFFFFF)" borderRadius="xl"
      boxShadow="var(--shadow-sm)" border="1px solid" borderColor="cyan.100">
      <Card.Body p={{ base: 6, md: 8 }}>
        <HStack justify="space-between" mb={8}>
          <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
            アカウント編集
          </Heading>
          <Link href="/settings">
            <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
              _hover={{ color: "var(--text-main)" }}>
              <Icon.LuChevronLeft size={16} />
              <Text>戻る</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={6}>
          <Field.Root>
            <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
              氏名
            </Field.Label>
            <Input
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              border="1px solid" borderColor="cyan.100" borderRadius="lg"
              py={3} px={4} fontSize="md" transition="all 0.2s"
              _focus={{ outline: "none", borderColor: "var(--teal)", boxShadow: "0 0 0 3px rgba(8,145,178,0.1)" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="sm" fontWeight="semibold" mb={2} color="var(--text-main)">
              ユーザー名
            </Field.Label>
            <Input
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              border="1px solid" borderColor="cyan.100" borderRadius="lg"
              py={3} px={4} fontSize="md" transition="all 0.2s"
              _focus={{ outline: "none", borderColor: "var(--teal)", boxShadow: "0 0 0 3px rgba(8,145,178,0.1)" }}
            />
          </Field.Root>

          <Button
            w="full" py={3.5} px={6} fontSize="md" fontWeight="semibold"
            style={{ background: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)" }}
            color="white" border="none" borderRadius="lg" cursor="pointer" transition="all 0.2s"
            onClick={handleUpdate} disabled={loading}
            boxShadow="0 4px 14px rgba(8,145,178,0.28)"
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(8,145,178,0.36)" }}
            _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            {loading ? "更新中..." : "更新する"}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 3: /settings/account/edit/page.jsx を作成する**

```jsx
import { Box } from "@chakra-ui/react";
import AccountEditForm from "@/app/feacher/settings/components/AccountEditForm";

export default function AccountEditPage() {
  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <AccountEditForm />
    </Box>
  );
}
```

- [ ] **Step 4: コミット**

```bash
git add src/app/feacher/account/components/accountForm/useUserProfile.js src/app/feacher/settings/components/AccountEditForm.jsx src/app/settings/account/edit/page.jsx
git commit -m "feat(settings): account edit page with redirect on success"
```

---

### Task 10: 組織管理編集ページ

**Files:**
- Create: `src/app/settings/organization/edit/page.jsx`

- [ ] **Step 1: ファイルを作成する**

```jsx
export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import OrganizationSettings from "@/app/feacher/account/components/organizationSettings/OrganizationSettings";
import * as Icon from "@/app/feacher/Icon";

export default async function OrganizationEditPage() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
  ]);

  if (org?.myRole !== "admin") redirect("/settings");

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
          組織管理
        </Heading>
        <Link href="/settings">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      <Box bg="var(--card-bg, #FFFFFF)" borderRadius="xl" boxShadow="var(--shadow-sm)"
        border="1px solid" borderColor="cyan.100" p={{ base: 5, md: 6 }}>
        <OrganizationSettings
          currentUserId={user?.id}
          currentUsername={profile?.username || profile?.full_name || "オーナー"}
        />
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/app/settings/organization/edit/page.jsx
git commit -m "feat(settings): organization edit page reusing OrganizationSettings"
```

---

### Task 11: ログページ + リダイレクト

**Files:**
- Create: `src/app/settings/log/page.jsx`
- Modify: `src/app/account/page.jsx`
- Modify: `src/app/account/log/page.jsx`

- [ ] **Step 1: /settings/log/page.jsx を作成する**

```jsx
export const dynamic = "force-dynamic";

import { Box, HStack, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getMyOrganization } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import Log from "@/app/feacher/account/components/logList/Log";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsLogPage() {
  const { user } = await getUser();
  const { data: org } = await getMyOrganization();

  return (
    <Box maxW="600px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="var(--teal-deeper)">
          アクションログ
        </Heading>
        <Link href="/settings">
          <HStack gap={1} color="var(--text-muted)" fontSize="sm" cursor="pointer"
            _hover={{ color: "var(--text-main)" }}>
            <Icon.LuChevronLeft size={16} />
            <Text>戻る</Text>
          </HStack>
        </Link>
      </HStack>

      {org?.id
        ? <Log orgId={org.id} currentUserId={user.id} />
        : <Log userId={user.id} currentUserId={user.id} />
      }
    </Box>
  );
}
```

- [ ] **Step 2: /account/page.jsx をリダイレクトに置き換える**

`src/app/account/page.jsx` の全内容を以下に置き換える：

```jsx
import { redirect } from "next/navigation";

export default function AccountPage() {
  redirect("/settings");
}
```

- [ ] **Step 3: /account/log/page.jsx をリダイレクトに置き換える**

`src/app/account/log/page.jsx` の全内容を以下に置き換える：

```jsx
import { redirect } from "next/navigation";

export default function AccountLogPage() {
  redirect("/settings/log");
}
```

- [ ] **Step 4: コミット**

```bash
git add src/app/settings/log/page.jsx src/app/account/page.jsx src/app/account/log/page.jsx
git commit -m "feat(settings): log page and redirects from /account to /settings"
```

---

### Task 12: ナビゲーション更新

**Files:**
- Modify: `src/app/feacher/partials/FooterNavbar/FooterNavber.jsx`
- Modify: `src/app/feacher/partials/Navber/Navbar.jsx`

- [ ] **Step 1: FooterNavber.jsx を更新する**

`NAV_ITEMS` 配列の最後の要素を変更する（`/account` → `/settings`、アイコンとラベル更新）：

```js
const NAV_ITEMS = [
  { href: "/",             icon: <Icon.IoHomeOutline />,                label: "ホーム" },
  { href: "/coinLaundry",  icon: <Icon.MdOutlineLocalLaundryService />, label: "店舗" },
  { href: "/collectMoney", icon: <Icon.BiCoinStack />,                  label: "収益" },
  { href: "/settings",     icon: <Icon.LuSettings />,                   label: "設定" },
];
```

- [ ] **Step 2: Navbar.jsx を更新する**

`/account` の Link を `/settings` に変更し、テキストを「設定」に変更する：

```jsx
<li>
  <Link href="/settings" className={styles.navItem}>
    <span>設定</span>
  </Link>
</li>
```

- [ ] **Step 3: コミット**

```bash
git add src/app/feacher/partials/FooterNavbar/FooterNavber.jsx src/app/feacher/partials/Navber/Navbar.jsx
git commit -m "feat(settings): update navigation to /settings with settings icon"
```

---

## 動作確認チェックリスト

- [ ] `/settings` でアカウント情報・組織情報（admin のみ）・アプリ設定・その他が表示される
- [ ] `/settings/account/edit` で氏名・ユーザー名を編集でき、保存後 `/settings` に戻る
- [ ] `/settings/organization/edit` で組織名編集・メンバー管理・招待ができる（admin のみ、非 admin は /settings にリダイレクト）
- [ ] `/settings/log` でアクションログが表示され、「戻る」で `/settings` に戻る
- [ ] 集金方法の変更が DB に即時保存される
- [ ] ダークモード切替が機能し、ページ再読み込み後も維持される
- [ ] `/account` と `/account/log` へのアクセスが自動的にリダイレクトされる
- [ ] フッターナビゲーションの「設定」タブがアクティブ状態になる
- [ ] PC ナビゲーションの「設定」リンクが機能する
