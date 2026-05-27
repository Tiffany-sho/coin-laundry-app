# サブスクリプション機能 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stripe を使った組織単位の3段階プラン（Free/Pro/Max）を実装し、店舗登録数を制限する。

**Architecture:** `organizations` テーブルに `plan`・Stripe ID 系カラムを追加し、Checkout/Webhook/Portal の3本の API Route で課金フローを完結させる。`createStore()` Server Action でプラン上限を確認してブロックし、設定ページと店舗一覧ページに制限状態を表示する。

**Tech Stack:** Next.js 16 App Router, Supabase (service client), Stripe Node SDK, Chakra UI v3

---

## ファイルマップ

| 操作 | パス | 役割 |
|------|------|------|
| 新規作成 | `src/functions/plans.js` | プラン定数（上限・表示名） |
| 新規作成 | `src/utils/stripe/client.js` | Stripe シングルトン |
| 新規作成 | `src/app/api/stripe/checkout/route.js` | Checkout Session 作成 |
| 新規作成 | `src/app/api/stripe/webhook/route.js` | Webhook 受信・DB 更新 |
| 新規作成 | `src/app/api/stripe/portal/route.js` | カスタマーポータル Session 作成 |
| 新規作成 | `src/app/feacher/settings/components/PlanCard.jsx` | 設定ページのプランカード |
| 新規作成 | `src/app/feacher/settings/components/PlanGrid.jsx` | プラン比較グリッド |
| 新規作成 | `src/app/settings/plan/page.jsx` | /settings/plan ページ |
| 変更 | `src/app/feacher/Icon.js` | LuZap・LuCreditCard を追加 |
| 変更 | `src/app/api/supabaseFunctions/supabaseDatabase/organization/action.js` | `getOrgPlan()` 追加 |
| 変更 | `src/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action.js` | `createStore()` に上限チェック追加 |
| 変更 | `src/app/coinLaundry/CoinLaundryData.jsx` | planInfo を取得して渡す |
| 変更 | `src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx` | atLimit バナーを表示 |
| 変更 | `src/app/feacher/coinLandry/components/CoinLaundryList/AddBtn.jsx` | atLimit prop で無効化 |
| 変更 | `src/app/settings/page.jsx` | PlanCard を追加 |

---

## Task 1: Stripe インストール・環境変数設定

**Files:**
- Modify: `package.json`（npm install）
- Modify: `.env.local`（環境変数追加）

- [ ] **Step 1: Stripe SDK をインストールする**

```bash
npm install stripe
```

期待出力: `added 1 package` または類似メッセージ

- [ ] **Step 2: `.env.local` に環境変数を追加する**

既存の `.env.local` に以下を追記する（Stripe ダッシュボードの値を後で設定）:

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_MAX_PRICE_ID=price_xxxxxxxxxxxxxxxx
STRIPE_PRO_TRIAL_DAYS=14
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

本番の Vercel 環境変数にも同じキーで設定すること（`NEXT_PUBLIC_APP_URL` は `https://www.collecie.com`）。

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

期待出力: `✓ Compiled` でエラーなし

- [ ] **Step 4: コミットする**

```bash
git add package.json package-lock.json
git commit -m "deps: install stripe SDK"
```

---

## Task 2: DB マイグレーション（Supabase）

**Files:**
- なし（Supabase ダッシュボードの SQL Editor で実行）

- [ ] **Step 1: Supabase ダッシュボードの SQL Editor を開いて以下を実行する**

```sql
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
```

- [ ] **Step 2: 既存レコードが `plan = 'free'` になっていることを確認する**

```sql
SELECT id, name, plan FROM public.organizations LIMIT 10;
```

期待結果: `plan` 列が全行 `free` であること

- [ ] **Step 3: コミットする（SQL をドキュメントとして残す）**

```bash
git commit --allow-empty -m "db: add plan/stripe columns to organizations table (run in Supabase SQL Editor)"
```

---

## Task 3: プラン定数 + Icon 追加

**Files:**
- Create: `src/functions/plans.js`
- Modify: `src/app/feacher/Icon.js`

- [ ] **Step 1: `src/functions/plans.js` を作成する**

```js
export const PLAN_LIMITS = {
  free: 3,
  pro: 5,
  max: Infinity,
};

export const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
};
```

- [ ] **Step 2: `src/app/feacher/Icon.js` に `LuZap` と `LuCreditCard` を追加する**

import 行を以下に変更する（`LuBuilding2,` の直後に追記）:

```js
import {
  LuInfo,
  LuWallet,
  LuAtSign,
  LuUser,
  LuUserCheck,
  LuCrown,
  LuCheck,
  LuWrench,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
  LuMinus,
  LuPlus,
  LuPencilLine,
  LuX,
  LuFileImage,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
  LuCalendar,
  LuPackage,
  LuRefreshCw,
  LuEyeOff,
  LuEye,
  LuInbox,
  LuHistory,
  LuFileText,
  LuUsers,
  LuSearch,
  LuMail,
  LuPencil,
  LuSettings,
  LuSun,
  LuMoon,
  LuBuilding2,
  LuZap,
  LuCreditCard,
} from "react-icons/lu";
```

export 文末尾に追記する:

```js
  LuZap,
  LuCreditCard,
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/functions/plans.js src/app/feacher/Icon.js
git commit -m "feat(subscription): add plan constants and icons"
```

---

## Task 4: `getOrgPlan()` ヘルパー

**Files:**
- Modify: `src/app/api/supabaseFunctions/supabaseDatabase/organization/action.js`

- [ ] **Step 1: ファイル先頭の import に `PLAN_LIMITS` を追加する**

`"use server";` の下の import 群に追記:

```js
import { PLAN_LIMITS } from "@/functions/plans";
```

- [ ] **Step 2: ファイル末尾に `getOrgPlan()` を追加する**

```js
export async function getOrgPlan() {
  const { user } = await getUser();
  if (!user) return { error: "ログインしてください" };

  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (memberError) return { error: "組織情報の取得に失敗しました" };

  const serviceSupabase = createServiceClient();
  const { data: org, error: orgError } = await serviceSupabase
    .from("organizations")
    .select("plan, stripe_customer_id, stripe_subscription_id, trial_ends_at")
    .eq("id", member.org_id)
    .single();

  if (orgError) return { error: "プラン情報の取得に失敗しました" };

  const { count } = await serviceSupabase
    .from("laundry_store")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", member.org_id);

  const plan = org.plan ?? "free";
  const rawLimit = PLAN_LIMITS[plan];

  return {
    data: {
      plan,
      storeCount: count ?? 0,
      storeLimit: rawLimit === Infinity ? null : rawLimit,
      trialEndsAt: org.trial_ends_at,
      stripeCustomerId: org.stripe_customer_id,
      orgId: member.org_id,
    },
  };
}
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/app/api/supabaseFunctions/supabaseDatabase/organization/action.js
git commit -m "feat(subscription): add getOrgPlan() helper"
```

---

## Task 5: Stripe クライアント + Checkout API Route

**Files:**
- Create: `src/utils/stripe/client.js`
- Create: `src/app/api/stripe/checkout/route.js`

- [ ] **Step 1: `src/utils/stripe/client.js` を作成する**

```js
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

- [ ] **Step 2: `src/app/api/stripe/checkout/route.js` を作成する**

```js
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request) {
  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planKey } = await request.json();
  if (!["pro", "max"].includes(planKey)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: planInfo, error } = await getOrgPlan();
  if (error || !planInfo) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const priceId =
    planKey === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_MAX_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const serviceSupabase = createServiceClient();
  let customerId = planInfo.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { org_id: planInfo.orgId },
    });
    customerId = customer.id;
    await serviceSupabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", planInfo.orgId);
  }

  const sessionParams = {
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan`,
    metadata: { org_id: planInfo.orgId },
  };

  if (planKey === "pro" && process.env.STRIPE_PRO_TRIAL_DAYS) {
    sessionParams.subscription_data = {
      trial_period_days: parseInt(process.env.STRIPE_PRO_TRIAL_DAYS, 10),
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/utils/stripe/client.js src/app/api/stripe/checkout/route.js
git commit -m "feat(subscription): add Stripe checkout API route"
```

---

## Task 6: Stripe Webhook API Route

**Files:**
- Create: `src/app/api/stripe/webhook/route.js`

- [ ] **Step 1: `src/app/api/stripe/webhook/route.js` を作成する**

```js
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { createServiceClient } from "@/utils/supabase/service";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orgId = session.metadata?.org_id;
    if (!orgId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );
    const planKey = getPlanFromPriceId(
      subscription.items.data[0].price.id
    );
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    await serviceSupabase
      .from("organizations")
      .update({
        plan: planKey,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
      })
      .eq("id", orgId);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const orgId = await getOrgIdFromCustomer(
      serviceSupabase,
      subscription.customer
    );
    if (!orgId) return NextResponse.json({ received: true });

    const planKey = getPlanFromPriceId(
      subscription.items.data[0].price.id
    );
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    await serviceSupabase
      .from("organizations")
      .update({
        plan: planKey,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
      })
      .eq("id", orgId);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const orgId = await getOrgIdFromCustomer(
      serviceSupabase,
      subscription.customer
    );
    if (!orgId) return NextResponse.json({ received: true });

    await serviceSupabase
      .from("organizations")
      .update({
        plan: "free",
        stripe_subscription_id: null,
        trial_ends_at: null,
      })
      .eq("id", orgId);
  }

  return NextResponse.json({ received: true });
}

async function getOrgIdFromCustomer(supabase, customerId) {
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.id ?? null;
}

function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_MAX_PRICE_ID) return "max";
  return "free";
}
```

- [ ] **Step 2: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 3: ローカルで Webhook をテストする（Stripe CLI が必要）**

別ターミナルで以下を実行して、ローカルに Webhook を転送する:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

出力された `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定し、開発サーバーを再起動する。

- [ ] **Step 4: コミットする**

```bash
git add src/app/api/stripe/webhook/route.js
git commit -m "feat(subscription): add Stripe webhook handler"
```

---

## Task 7: Stripe Portal API Route

**Files:**
- Create: `src/app/api/stripe/portal/route.js`

- [ ] **Step 1: `src/app/api/stripe/portal/route.js` を作成する**

```js
import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";

export async function POST() {
  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: planInfo, error } = await getOrgPlan();
  if (error || !planInfo?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 404 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: planInfo.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/app/api/stripe/portal/route.js
git commit -m "feat(subscription): add Stripe customer portal API route"
```

---

## Task 8: `createStore()` にプラン上限チェックを追加

**Files:**
- Modify: `src/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action.js`

- [ ] **Step 1: ファイル先頭の import に `PLAN_LIMITS` を追加する**

`"use server";` の下の import 群に追記:

```js
import { PLAN_LIMITS } from "@/functions/plans";
```

- [ ] **Step 2: `createStore()` 内の `serviceSupabase` 作成直後にプラン上限チェックを追加する**

`const serviceSupabase = createServiceClient();` の直後、既存の `try {` ブロック内の先頭に以下を追加する:

```js
  const serviceSupabase = createServiceClient();
  try {
    // プラン上限チェック
    const { data: orgData } = await serviceSupabase
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .single();

    const plan = orgData?.plan ?? "free";
    const storeLimit = PLAN_LIMITS[plan];

    if (storeLimit !== Infinity) {
      const { count } = await serviceSupabase
        .from("laundry_store")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      if (count >= storeLimit) {
        return {
          error: `プランの上限（${storeLimit}店舗）に達しています。アップグレードしてください。`,
        };
      }
    }

    // 既存の insert 処理（変更なし）
    const { data, error: storeError } = await serviceSupabase
      ...
```

変更後の `createStore()` 全体は以下のようになる:

```js
export async function createStore(formData) {
  const supabase = await createClient();
  const { user } = await getUser();
  if (!user) return { error: "ユーザーが認証されていません。" };

  const { orgId, myRole } = await getMyOrgId(supabase, user.id);
  if (!orgId || myRole !== "admin") return { error: "店舗を作成する権限がありません。" };

  const machinesString = formData.get("machines");
  const imagesString = formData.get("images");
  const machinesData = machinesString ? JSON.parse(machinesString) : [];
  const imagesData = imagesString ? JSON.parse(imagesString) : [];

  const serviceSupabase = createServiceClient();
  try {
    // プラン上限チェック
    const { data: orgData } = await serviceSupabase
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .single();

    const plan = orgData?.plan ?? "free";
    const storeLimit = PLAN_LIMITS[plan];

    if (storeLimit !== Infinity) {
      const { count } = await serviceSupabase
        .from("laundry_store")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

      if (count >= storeLimit) {
        return {
          error: `プランの上限（${storeLimit}店舗）に達しています。アップグレードしてください。`,
        };
      }
    }

    const { data, error: storeError } = await serviceSupabase
      .from("laundry_store")
      .insert({
        store: formData.get("store"),
        location: formData.get("location"),
        description: formData.get("description"),
        machines: machinesData,
        images: imagesData,
        owner: user.id,
        organization_id: orgId,
      })
      .select("id,machines,store,owner")
      .single();

    if (storeError) return { error: "店舗登録に失敗しました" };

    const machinesState = data.machines.map((machine) => ({
      id: machine.id,
      name: machine.name,
      break: false,
      comment: "",
    }));

    const addStates = [
      { id: crypto.randomUUID(), name: "両替機", break: false, comment: "" },
      { id: crypto.randomUUID(), name: "店内状況", break: false, comment: "" },
      { id: crypto.randomUUID(), name: "備品", break: false, comment: "" },
    ];
    machinesState.unshift(...addStates);

    const { error: stockError } = await serviceSupabase.from("laundry_state").insert({
      laundryId: data.id,
      laundryName: data.store,
      detergent: 0,
      softener: 0,
      machines: machinesState,
      stocker: data.owner,
    });

    if (stockError) return { error: "在庫情報の登録に失敗しました" };
    return { data };
  } catch {
    return { error: { msg: "予期しないエラーが発生しました", status: 400 } };
  }
}
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/app/api/supabaseFunctions/supabaseDatabase/laundryStore/action.js
git commit -m "feat(subscription): enforce plan store limit in createStore()"
```

---

## Task 9: `AddBtn.jsx` に上限時の無効化を追加

**Files:**
- Modify: `src/app/feacher/coinLandry/components/CoinLaundryList/AddBtn.jsx`

- [ ] **Step 1: `AddBtn.jsx` を以下で置き換える**

```jsx
import { Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuPlus } from "@/app/feacher/Icon";

const AddBtn = ({ atLimit = false }) => {
  if (atLimit) {
    return (
      <Link href="/settings/plan">
        <Button
          position="fixed"
          bottom={{ base: "15%", md: "5%" }}
          right={{ base: "5%", md: "5%" }}
          zIndex="1350"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={1}
          bg="gray.400"
          color="white"
          w={{ base: "60px", md: "70px" }}
          h={{ base: "60px", md: "70px" }}
          borderRadius="full"
          border="2px solid"
          borderColor="gray.500"
          boxShadow="0 4px 15px rgba(0,0,0,0.15)"
          title="プランの上限に達しました"
        >
          <Box>
            <LuPlus style={{ height: "28px", width: "28px", strokeWidth: "2.5" }} />
          </Box>
          <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" letterSpacing="wide">
            上限
          </Text>
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/coinLaundry/new">
      <Button
        position="fixed"
        bottom={{ base: "15%", md: "5%" }}
        right={{ base: "5%", md: "5%" }}
        zIndex="1350"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={1}
        bg="cyan.600"
        color="white"
        w={{ base: "60px", md: "70px" }}
        h={{ base: "60px", md: "70px" }}
        borderRadius="full"
        border="2px solid"
        borderColor="cyan.700"
        boxShadow="0 4px 15px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          bg: "cyan.700",
          transform: "scale(1.1) translateY(-2px)",
          boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        _active={{ transform: "scale(0.95)", bg: "cyan.700" }}
      >
        <Box>
          <LuPlus style={{ height: "28px", width: "28px", strokeWidth: "2.5" }} />
        </Box>
        <Text fontSize={{ base: "2xs", md: "xs" }} fontWeight="bold" letterSpacing="wide">
          追加
        </Text>
      </Button>
    </Link>
  );
};

export default AddBtn;
```

- [ ] **Step 2: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/app/feacher/coinLandry/components/CoinLaundryList/AddBtn.jsx
git commit -m "feat(subscription): disable AddBtn when store limit reached"
```

---

## Task 10: 店舗一覧ページにプラン情報を渡す

**Files:**
- Modify: `src/app/coinLaundry/CoinLaundryData.jsx`
- Modify: `src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx`

- [ ] **Step 1: `CoinLaundryData.jsx` を以下で置き換える**

```jsx
import CoinLaundryClientPage from "@/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage";
import ErrorPage from "@/app/feacher/jumpPage/ErrorPage/ErrorPage";
import { getStores } from "../api/supabaseFunctions/supabaseDatabase/laundryStore/action";
import { getMyOrganization, getOrgPlan } from "../api/supabaseFunctions/supabaseDatabase/organization/action";

const CoinLaundryData = async () => {
  const [storesResult, orgResult, planResult] = await Promise.all([
    getStores(),
    getMyOrganization(),
    getOrgPlan(),
  ]);

  if (storesResult.error)
    return (
      <ErrorPage
        title={storesResult.error.msg}
        status={storesResult.error.status}
      />
    );

  const planInfo = planResult.data ?? null;

  return (
    <CoinLaundryClientPage
      stores={storesResult.data}
      myRole={orgResult.data?.myRole ?? "viewer"}
      planInfo={planInfo}
    />
  );
};

export default CoinLaundryData;
```

- [ ] **Step 2: `CoinLaundryClientPage.jsx` を以下で置き換える**

```jsx
"use client";

import { useState, useMemo } from "react";
import { Box, Container, Flex, Text, VStack, Heading, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import CoinLaundryList from "./CoinLaundryList";
import AddBtn from "./AddBtn";
import SearchBox from "../SearchBox";

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

const PlanLimitBanner = ({ storeCount, storeLimit }) => (
  <Box
    bg="orange.50"
    border="1px solid"
    borderColor="orange.200"
    borderRadius="lg"
    p={4}
  >
    <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
      <Text fontSize="sm" color="orange.800" fontWeight="medium">
        店舗数が上限（{storeCount}/{storeLimit}）に達しています。アップグレードで追加登録できます。
      </Text>
      <Link href="/settings/plan">
        <Button size="xs" colorPalette="orange" variant="outline">
          プランを見る
        </Button>
      </Link>
    </Flex>
  </Box>
);

const CoinLaundryClientPage = ({ stores, myRole, planInfo }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const atLimit = planInfo !== null &&
    planInfo.storeLimit !== null &&
    planInfo.storeCount >= planInfo.storeLimit;

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(
      (store) =>
        store.store.toLowerCase().includes(q) ||
        store.location.toLowerCase().includes(q),
    );
  }, [stores, searchQuery]);

  const countText = useMemo(() => {
    if (stores.length === 0) return "店舗を追加してください";
    if (searchQuery.trim())
      return `${filteredStores.length}件 / 全${stores.length}店舗`;
    return `全${stores.length}店舗`;
  }, [stores.length, filteredStores.length, searchQuery]);

  return (
    <>
      <Box minH="100vh" py={8}>
        <Container maxW="1400px" px={{ base: 4, md: 6 }}>
          <VStack gap={6} mb={8} align="stretch">
            {atLimit && myRole === "admin" && (
              <PlanLimitBanner
                storeCount={planInfo.storeCount}
                storeLimit={planInfo.storeLimit}
              />
            )}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={4}
            >
              <Box>
                <Text color="var(--text-muted, #64748B)" fontSize={{ base: "sm", md: "md" }}>
                  {countText}
                </Text>
              </Box>

              {stores.length > 0 && (
                <SearchBox value={searchQuery} onChange={setSearchQuery} />
              )}
            </Flex>
          </VStack>

          <Box>
            {stores.length === 0 ? (
              <EmptyStoresState />
            ) : filteredStores.length === 0 ? (
              <NoResultsState query={searchQuery} />
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={6}
              >
                {filteredStores.map((item) => (
                  <CoinLaundryList
                    coinLaundry={item}
                    key={item.id}
                    myRole={myRole}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      {myRole !== "viewer" && <AddBtn atLimit={atLimit} />}
    </>
  );
};

export default CoinLaundryClientPage;
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/app/coinLaundry/CoinLaundryData.jsx src/app/feacher/coinLandry/components/CoinLaundryList/CoinLaundryClientPage.jsx
git commit -m "feat(subscription): show plan limit banner on store list page"
```

---

## Task 11: `PlanCard.jsx` コンポーネント

**Files:**
- Create: `src/app/feacher/settings/components/PlanCard.jsx`

- [ ] **Step 1: `src/app/feacher/settings/components/PlanCard.jsx` を作成する**

```jsx
"use client";

import { useState } from "react";
import { Card, HStack, VStack, Text, Box, Flex, Heading, Badge, Button } from "@chakra-ui/react";
import Link from "next/link";
import * as Icon from "@/app/feacher/Icon";
import { PLAN_NAMES } from "@/functions/plans";

export default function PlanCard({ planInfo }) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(null);

  const { plan, storeCount, storeLimit, trialEndsAt, stripeCustomerId } = planInfo;
  const planName = PLAN_NAMES[plan] ?? "Free";

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const isOnTrial = trialDaysLeft !== null && trialDaysLeft > 0;

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  const handleUpgrade = async (planKey) => {
    setIsLoadingCheckout(planKey);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <Card.Root
      w="full"
      bg="var(--card-bg, #FFFFFF)"
      borderRadius="xl"
      boxShadow="var(--shadow-sm)"
      border="1px solid"
      borderColor="cyan.100"
    >
      <Card.Body p={{ base: 5, md: 6 }}>
        <HStack justify="space-between" mb={5}>
          <Heading as="h2" fontSize="md" fontWeight="bold" color="var(--teal-deeper)">
            現在のプラン
          </Heading>
          <Link href="/settings/plan">
            <HStack
              gap={1.5} px={3} py={1.5}
              borderRadius="lg" border="1px solid" borderColor="cyan.100"
              color="var(--teal)" fontSize="sm" fontWeight="semibold"
              cursor="pointer" transition="all 0.2s"
              _hover={{ bg: "var(--teal-pale)", borderColor: "cyan.300" }}
            >
              <Icon.LuCreditCard size={14} />
              <Text>プラン詳細</Text>
            </HStack>
          </Link>
        </HStack>

        <VStack align="stretch" gap={3}>
          <HStack
            gap={3} p={4} bg="var(--teal-pale)"
            borderRadius="lg" border="1px solid" borderColor="cyan.100"
          >
            <Flex
              w="40px" h="40px" bg="var(--card-bg, white)" borderRadius="lg"
              align="center" justify="center" color="var(--teal)"
              flexShrink={0} boxShadow="var(--shadow-sm)"
            >
              <Icon.LuZap size={20} />
            </Flex>
            <Box flex={1}>
              <HStack gap={2} mb={1}>
                <Text fontSize="sm" fontWeight="bold" color="var(--teal-deeper)">
                  {planName}
                </Text>
                {isOnTrial && (
                  <Badge colorPalette="orange" size="sm">
                    トライアル中 残{trialDaysLeft}日
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="var(--text-muted)">
                店舗数: {storeCount} / {storeLimit === null ? "無制限" : storeLimit}
              </Text>
            </Box>
          </HStack>

          {plan === "free" && (
            <VStack gap={2} align="stretch">
              <Button
                size="sm"
                colorPalette="cyan"
                onClick={() => handleUpgrade("pro")}
                loading={isLoadingCheckout === "pro"}
                loadingText="移動中..."
              >
                Pro にアップグレード
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="cyan"
                onClick={() => handleUpgrade("max")}
                loading={isLoadingCheckout === "max"}
                loadingText="移動中..."
              >
                Max にアップグレード
              </Button>
            </VStack>
          )}

          {plan === "pro" && (
            <VStack gap={2} align="stretch">
              <Button
                size="sm"
                colorPalette="cyan"
                onClick={() => handleUpgrade("max")}
                loading={isLoadingCheckout === "max"}
                loadingText="移動中..."
              >
                Max にアップグレード
              </Button>
              {stripeCustomerId && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="cyan"
                  onClick={handleOpenPortal}
                  loading={isLoadingPortal}
                  loadingText="移動中..."
                >
                  プランを管理する
                </Button>
              )}
            </VStack>
          )}

          {plan === "max" && stripeCustomerId && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="cyan"
              onClick={handleOpenPortal}
              loading={isLoadingPortal}
              loadingText="移動中..."
            >
              プランを管理する
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
```

- [ ] **Step 2: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/app/feacher/settings/components/PlanCard.jsx
git commit -m "feat(subscription): add PlanCard component"
```

---

## Task 12: 設定ページに PlanCard を統合

**Files:**
- Modify: `src/app/settings/page.jsx`

- [ ] **Step 1: `src/app/settings/page.jsx` を以下で置き換える**

```jsx
export const dynamic = "force-dynamic";

import { Box, VStack, HStack, Heading } from "@chakra-ui/react";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";
import { getProfile } from "@/app/api/supabaseFunctions/supabaseDatabase/profiles/action";
import { getMyOrganization, getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import AccountInfoCard from "@/app/feacher/settings/components/AccountInfoCard";
import OrgInfoCard from "@/app/feacher/settings/components/OrgInfoCard";
import AppSettingsCard from "@/app/feacher/settings/components/AppSettingsCard";
import OtherActionsCard from "@/app/feacher/settings/components/OtherActionsCard";
import PlanCard from "@/app/feacher/settings/components/PlanCard";
import * as Icon from "@/app/feacher/Icon";

export default async function SettingsPage() {
  const { user } = await getUser();
  const [{ data: profile }, { data: org }, { data: planInfo }] = await Promise.all([
    getProfile(),
    getMyOrganization(),
    getOrgPlan(),
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
        {org?.myRole === "admin" && planInfo && <PlanCard planInfo={planInfo} />}
        <AppSettingsCard collectMethod={profile?.collectMethod} />
        <OtherActionsCard />
      </VStack>
    </Box>
  );
}
```

- [ ] **Step 2: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 3: コミットする**

```bash
git add src/app/settings/page.jsx
git commit -m "feat(subscription): add PlanCard to settings page"
```

---

## Task 13: `/settings/plan` プラン比較ページ

**Files:**
- Create: `src/app/feacher/settings/components/PlanGrid.jsx`
- Create: `src/app/settings/plan/page.jsx`

- [ ] **Step 1: `src/app/feacher/settings/components/PlanGrid.jsx` を作成する**

```jsx
"use client";

import { useState } from "react";
import { Box, VStack, HStack, Text, Button, Badge, Heading, Card } from "@chakra-ui/react";
import * as Icon from "@/app/feacher/Icon";

const PLANS = [
  {
    key: "free",
    name: "Free",
    storeLimit: "3店舗",
    features: ["集金記録", "在庫管理", "データ可視化"],
    trial: null,
  },
  {
    key: "pro",
    name: "Pro",
    storeLimit: "5店舗",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理"],
    trial: "無料トライアルあり",
  },
  {
    key: "max",
    name: "Max",
    storeLimit: "無制限",
    features: ["集金記録", "在庫管理", "データ可視化", "メンバー管理", "優先サポート"],
    trial: null,
  },
];

export default function PlanGrid({ currentPlan, stripeCustomerId }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleUpgrade = async (planKey) => {
    setLoadingPlan(planKey);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const handlePortal = async () => {
    setLoadingPlan("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
      gap={4}
    >
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        const isDowngrade =
          (currentPlan === "max" && plan.key !== "max") ||
          (currentPlan === "pro" && plan.key === "free");
        const isUpgradeable = !isCurrent && !isDowngrade && plan.key !== "free";

        return (
          <Card.Root
            key={plan.key}
            borderRadius="xl"
            border="2px solid"
            borderColor={isCurrent ? "cyan.400" : "cyan.100"}
            boxShadow={isCurrent ? "var(--shadow-hero)" : "var(--shadow-sm)"}
            bg="var(--card-bg, white)"
          >
            <Card.Body p={6}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Heading fontSize="xl" fontWeight="bold" color="var(--teal-deeper)">
                      {plan.name}
                    </Heading>
                    {isCurrent && <Badge colorPalette="cyan">現在のプラン</Badge>}
                  </HStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="var(--teal)"
                    fontFamily="'Space Mono', monospace"
                  >
                    ¥--
                    <Text as="span" fontSize="sm" color="var(--text-muted)" fontFamily="inherit">
                      /月
                    </Text>
                  </Text>
                  {plan.trial && (
                    <Badge colorPalette="orange" mt={1}>{plan.trial}</Badge>
                  )}
                </Box>

                <Text fontSize="sm" fontWeight="semibold" color="var(--text-main)">
                  {plan.storeLimit}
                </Text>

                <VStack align="stretch" gap={1}>
                  {plan.features.map((f) => (
                    <HStack key={f} gap={2}>
                      <Icon.LuCheck size={14} color="var(--teal)" />
                      <Text fontSize="sm" color="var(--text-muted)">{f}</Text>
                    </HStack>
                  ))}
                </VStack>

                {isCurrent ? (
                  stripeCustomerId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="cyan"
                      onClick={handlePortal}
                      loading={loadingPlan === "portal"}
                      loadingText="移動中..."
                    >
                      プランを管理する
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled colorPalette="cyan">
                      現在利用中
                    </Button>
                  )
                ) : isUpgradeable ? (
                  <Button
                    size="sm"
                    colorPalette="cyan"
                    onClick={() => handleUpgrade(plan.key)}
                    loading={loadingPlan === plan.key}
                    loadingText="移動中..."
                  >
                    {plan.trial ? "無料で試す" : "開始する"}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" disabled>
                    &nbsp;
                  </Button>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        );
      })}
    </Box>
  );
}
```

- [ ] **Step 2: `src/app/settings/plan/page.jsx` を作成する**

```jsx
export const dynamic = "force-dynamic";

import { Box, HStack, Heading } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import { getMyOrganization, getOrgPlan } from "@/app/api/supabaseFunctions/supabaseDatabase/organization/action";
import PlanGrid from "@/app/feacher/settings/components/PlanGrid";
import * as Icon from "@/app/feacher/Icon";

export default async function PlanPage() {
  const [{ data: org }, { data: planInfo }] = await Promise.all([
    getMyOrganization(),
    getOrgPlan(),
  ]);

  if (org?.myRole !== "admin") redirect("/settings");

  return (
    <Box maxW="860px" mx="auto" p={{ base: 4, md: 8 }}>
      <HStack gap={3} mb={8}>
        <Icon.LuCreditCard size={24} color="var(--teal)" />
        <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="var(--teal-deeper)">
          プラン選択
        </Heading>
      </HStack>

      <PlanGrid
        currentPlan={planInfo?.plan ?? "free"}
        stripeCustomerId={planInfo?.stripeCustomerId ?? null}
      />
    </Box>
  );
}
```

- [ ] **Step 3: ビルドエラーがないことを確認する**

```bash
npm run build
```

- [ ] **Step 4: コミットする**

```bash
git add src/app/feacher/settings/components/PlanGrid.jsx src/app/settings/plan/page.jsx
git commit -m "feat(subscription): add /settings/plan page with plan comparison grid"
```

---

## Task 14: E2E 動作確認

このタスクは手動で確認する。

- [ ] **Step 1: 開発サーバーと Stripe CLI を起動する**

ターミナル1:
```bash
npm run dev
```

ターミナル2（Stripe CLI が必要: `stripe` コマンドが使える状態で）:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

出力された `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定する。設定後は開発サーバーを再起動する。

- [ ] **Step 2: 設定ページ（`/settings`）を確認する**

1. ブラウザで `http://localhost:3000/settings` を開く
2. admin ユーザーでログインしていることを確認
3. 「現在のプラン」カードが表示されること
4. `Free / 店舗数: X / 3` が表示されること

- [ ] **Step 3: プラン詳細ページ（`/settings/plan`）を確認する**

1. `http://localhost:3000/settings/plan` を開く
2. 3カラムのプラン比較グリッドが表示されること
3. Free 列に「現在利用中」が表示されること
4. Pro・Max 列にアップグレードボタンが表示されること

- [ ] **Step 4: 店舗一覧ページの制限バナーを確認する**

1. 現在の組織が Free プランで 3 店舗登録済みの場合:
   - `http://localhost:3000/coinLaundry` を開く
   - オレンジのバナーが表示されること
   - 右下の FAB ボタンがグレーの「上限」ボタンになっていること
2. FAB ボタンをタップすると `/settings/plan` に遷移すること

- [ ] **Step 5: Stripe Checkout フローを確認する**

（Stripe テストモードの Price ID が設定済みの場合）
1. `/settings/plan` で「無料で試す」または「開始する」をクリック
2. Stripe のテスト決済ページにリダイレクトされること
3. テストカード `4242 4242 4242 4242` で決済を完了する
4. `/settings?checkout=success` にリダイレクトされること
5. Stripe CLI のターミナルに `checkout.session.completed` が表示されること
6. `/settings` の「現在のプラン」が Pro/Max に変わっていること

- [ ] **Step 6: Server Action の上限チェックを確認する**

1. Free プランで 3 店舗が登録済みの状態で `/coinLaundry/new` から店舗作成を試みる
2. 「プランの上限（3店舗）に達しています」エラーが表示されること

---

## Stripe ダッシュボード設定チェックリスト

実装後、以下を Stripe ダッシュボードで設定すること:

- [ ] Pro 商品・価格を作成し `STRIPE_PRO_PRICE_ID` を設定
- [ ] Max 商品・価格を作成し `STRIPE_MAX_PRICE_ID` を設定
- [ ] 本番の Webhook エンドポイントを `https://www.collecie.com/api/stripe/webhook` で登録し `STRIPE_WEBHOOK_SECRET` を更新
- [ ] カスタマーポータルを有効化（ダッシュボード → Billing → Customer portal）
- [ ] Vercel の環境変数に全ての `STRIPE_*` 変数を設定
