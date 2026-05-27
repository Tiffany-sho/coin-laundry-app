# サブスクリプション機能 設計仕様

**作成日**: 2026-05-27  
**対象アプリ**: Collecie（コインランドリー集金アプリ）  
**ステータス**: 承認済み

---

## 概要

組織単位の3段階サブスクリプション機能を Stripe で実装する。  
課金単位は組織（admin が支払う）、プランは Free / Pro / Max の3種類。

| プラン | 店舗登録上限 | トライアル | 決済 |
|--------|------------|-----------|------|
| Free   | 3店舗      | なし      | 無料 |
| Pro    | 5店舗      | あり（期間TBD） | 有料（料金TBD） |
| Max    | 無制限     | なし      | 有料（料金TBD） |

---

## 1. データモデル

### `organizations` テーブルへの追加カラム

```sql
ALTER TABLE public.organizations
  ADD COLUMN plan text NOT NULL DEFAULT 'free',
  ADD COLUMN stripe_customer_id text,
  ADD COLUMN stripe_subscription_id text,
  ADD COLUMN trial_ends_at timestamptz;
```

既存レコードは全て `plan = 'free'` で初期化される。

### プラン定数（アプリ内）

```js
// src/functions/plans.js
export const PLAN_LIMITS = {
  free: 3,
  pro:  5,
  max:  Infinity,
};

export const PLAN_NAMES = {
  free: 'Free',
  pro:  'Pro',
  max:  'Max',
};
```

---

## 2. Stripe 連携フロー

### アップグレードフロー

```
設定ページ → アップグレードボタン
    ↓
POST /api/stripe/checkout
    ↓ Checkout Session 作成（metadata: { org_id }）
    ↓ Stripe ホスト型決済ページへリダイレクト
    ↓ 決済完了
    ↓ Stripe → Webhook 送信
POST /api/stripe/webhook
    ↓ 署名検証（STRIPE_WEBHOOK_SECRET）
    ↓ DB 更新（plan / stripe_customer_id / stripe_subscription_id / trial_ends_at）
設定ページに反映
```

### API Routes

| エンドポイント | メソッド | 役割 |
|---|---|---|
| `/api/stripe/checkout` | POST | Checkout Session 作成・URL返却 |
| `/api/stripe/webhook` | POST | Webhook 受信・署名検証・DB更新 |
| `/api/stripe/portal` | POST | カスタマーポータル Session 作成・URL返却 |

### 受信する Webhook イベント

| イベント | 処理内容 |
|---|---|
| `checkout.session.completed` | `plan` を更新、Pro の場合 `trial_ends_at` を保存 |
| `customer.subscription.updated` | プラン変更・トライアル終了後の本課金移行を反映 |
| `customer.subscription.deleted` | `plan = 'free'` にダウングレード |

### 環境変数（追加分）

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...   # 料金確定後に設定
STRIPE_MAX_PRICE_ID=price_...   # 料金確定後に設定
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 3. プラン制限の適用

### `getOrgPlan()` ヘルパー（新規）

`src/app/api/supabaseFunctions/supabaseDatabase/organization/action.js` に追加。

```js
// 戻り値
{
  plan: 'free' | 'pro' | 'max',
  storeCount: number,
  storeLimit: number,     // PLAN_LIMITS[plan]
  trialEndsAt: string | null,
  stripeCustomerId: string | null,
}
```

### `createStore()` の変更

```
既存の admin ロール確認
    ↓ getOrgPlan() を呼び出し
    ↓ storeCount >= storeLimit の場合
    → { error: "プランの上限に達しています。アップグレードしてください。" }
    ↓ 以内の場合
    → 店舗作成（既存処理）
```

### ダウングレード時の方針

- 既存店舗は削除しない（既存データは保持）
- 新規作成だけをブロックする
- 例: Pro→Free で店舗4件 → 既存4件維持、5件目の作成不可

---

## 4. UI

### 設定ページ（`/settings`）

`PlanCard` コンポーネントを追加（`OrgInfoCard` の下、admin のみ表示）。

```
┌─────────────────────────────────────┐
│  現在のプラン                        │
│                                     │
│  ● Pro  （トライアル中 残9日）        │
│  店舗数: 3 / 5                       │
│                                     │
│  [プランを変更・管理する →]           │  ← Stripe カスタマーポータルへ
│  [Max にアップグレード →]             │  ← Stripe Checkout へ
└─────────────────────────────────────┘
```

表示ロジック:
- Free → Pro / Max へのアップグレードボタン
- Pro → Max へのアップグレード + 「管理する」ボタン
- Max → 「管理する」ボタンのみ

### `/settings/plan` ページ（プラン比較）

ログイン済みユーザー向けのプラン選択ページ。

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Free    │  │  Pro     │  │  Max     │
│ ¥ --/月  │  │ ¥ --/月  │  │ ¥ --/月  │
│          │  │ トライアル│  │          │
│ 3 店舗   │  │ 5 店舗   │  │ 無制限   │
│          │  │          │  │          │
│ 現在利用中│  │[開始する] │  │[開始する] │
└──────────┘  └──────────┘  └──────────┘
```

料金は `--` 表示で実装し、Stripe Price 設定後に差し替える。

### 店舗登録画面での制限表示

上限到達時に新規作成ボタンを非活性にしてバナーを表示。

```
店舗数が上限（3/3）に達しています。
プランをアップグレードすると追加登録できます。[プランを見る →]
```

---

## 5. セキュリティ考慮事項

- `/api/stripe/webhook` は認証不要だが必ず `stripe.webhooks.constructEvent` で署名検証する
- Stripe の `metadata.org_id` でどの組織の更新かを特定する（ユーザーIDでなく org_id を使う）
- `stripe_customer_id` は `organizations` に1対1で紐付け、重複作成を防ぐ
- `createStore()` の上限チェックは service client ではなく組織確認済みの文脈で行う

---

## 6. 未決事項

- Pro / Max の月額料金
- Pro トライアル期間（日数）
- ダウングレード時のユーザーへの通知方法（メール・アプリ内通知）
