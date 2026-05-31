# CLAUDE.md — Collecie (コインランドリー集金アプリ)

## プロジェクト概要

コインランドリーの集金業務を効率化するWebアプリ。  
店舗登録・集金記録・在庫/機器状態管理・データ可視化を一元管理する。

- **公開URL**: https://www.collecie.com/
- **リポジトリ**: https://github.com/Tiffany-sho/coin-laundry-app

---

## 技術スタック

| 役割                 | 技術                                  |
| -------------------- | ------------------------------------- |
| フレームワーク       | Next.js 16 (App Router)               |
| UIライブラリ         | Chakra UI v3                          |
| バックエンド/DB/認証 | Supabase (RLS有効)                    |
| チャート             | Recharts                              |
| デプロイ             | Vercel                                |
| スタイリング         | Chakra UI優先（`module.css`は最小限） |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   └── supabaseFunctions/
│   │       ├── supabaseDatabase/   # DB操作（CRUD）はここに集約
│   │       └── supabaseStorage/    # ストレージ操作
│   ├── feacher/                    # 機能別UIコンポーネント群
│   │   ├── partials/               # レイアウト共通部品（Navbar, Footer, BarChartSkeleton等）
│   │   ├── coinLandry/             # 店舗関連UI
│   │   ├── collectMoney/           # 集金関連UI
│   │   ├── dialog/                 # ダイアログ群
│   │   ├── inventory/              # 在庫管理UI（InventoryStoreCard, InventoryClientPage）
│   │   ├── equipment/              # 設備管理UI（EquipmentStoreCard, EquipmentClientPage）
│   │   ├── settings/               # 設定ページUI（PlanCard, PlanGrid, CheckoutSuccessBanner, CollectScheduleCard）
│   │   ├── home/
│   │   │   └── components/LoginUserHome/  # CollectCountdown（集金カウントダウン）等
│   │   └── ...
│   ├── coinLaundry/                # 店舗ページ（一覧・詳細・新規）
│   ├── collectMoney/               # 集金ページ
│   ├── inventory/                  # 在庫管理ページ（全店舗の洗剤・柔軟剤・カスタム在庫）
│   ├── equipment/                  # 設備管理ページ（全店舗の機器故障状況）
│   ├── settings/                   # 設定ページ（アカウント・組織・プラン）
│   ├── account/                    # /settings へリダイレクト（旧アカウントページ）
│   ├── privacy/                    # プライバシーポリシーページ
│   ├── terms/                      # 利用規約ページ
│   ├── tokushoho/                  # 特定商取引法に基づく表記ページ
│   └── auth/                       # 認証ページ
├── components/
│   └── ui/                         # 汎用UIコンポーネント（Chakra UI拡張）
├── functions/                      # ユーティリティ関数
│   ├── makeDate/                   # 日付変換ユーティリティ
│   └── collectSchedule.js          # 集金スケジュール計算（getNextCollectDate）
└── seeds/                          # シードデータ
```

---

## DB_SQL

- CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',          -- 'free' | 'pro' | 'max'
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  collect_schedule jsonb,                     -- 集金スケジュール: {type:"weekly"|"monthly", days:[...]}
                                              --   weekly: days は曜日番号の配列 (0=日〜6=土)
                                              --   monthly: days は日付の配列 (1〜31)
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
  );
  -- ※ collect_schedule カラムは後付けで追加:
  -- ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS collect_schedule jsonb;
- CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,  -- "admin" | "collecter" | "viewer"
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  );
- CREATE TABLE public.organization_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  org_id uuid NOT NULL,
  email text,
  role text NOT NULL,
  invited_by uuid NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  CONSTRAINT organization_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT organization_invitations_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.profiles(id)
  );
- CREATE TABLE public.action_message (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  message text,
  date bigint,
  user uuid DEFAULT auth.uid(),
  org_id uuid,
  CONSTRAINT action_message_pkey PRIMARY KEY (id),
  CONSTRAINT action_message_user_fkey FOREIGN KEY (user) REFERENCES public.profiles(id),
  CONSTRAINT action_message_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  );
- CREATE TABLE public.collect_funds (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  laundryId uuid DEFAULT gen_random_uuid(),
  laundryName text,
  date bigint,
  fundsArray jsonb,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  collecter uuid DEFAULT auth.uid(),
  totalFunds bigint,
  CONSTRAINT collect_funds_pkey PRIMARY KEY (id),
  CONSTRAINT collect_funds_laundryId_fkey FOREIGN KEY (laundryId) REFERENCES public.laundry_store(id),
  CONSTRAINT collect_funds_collecter_fkey FOREIGN KEY (collecter) REFERENCES public.profiles(id)
  );
- CREATE TABLE public.laundry_state (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  laundryId uuid DEFAULT gen_random_uuid() UNIQUE,
  detergent bigint,
  softener bigint,
  machines jsonb,
  extra_stocks jsonb DEFAULT '[]'::jsonb,       -- カスタム在庫: [{id, name, count, threshold}]
  stock_thresholds jsonb DEFAULT '{"detergent":1,"softener":1}'::jsonb,  -- 警告ライン設定
  stocker uuid DEFAULT auth.uid(),
  laundryName text,
  CONSTRAINT laundry_state_pkey PRIMARY KEY (id),
  CONSTRAINT laundry_stock_laundryId_fkey FOREIGN KEY (laundryId) REFERENCES public.laundry_store(id),
  CONSTRAINT laundry_state_stocker_fkey FOREIGN KEY (stocker) REFERENCES public.profiles(id)
  );
- CREATE TABLE public.laundry_store (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  store text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  machines jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  owner uuid NOT NULL DEFAULT auth.uid(),
  organization_id uuid,
  CONSTRAINT laundry_store_pkey PRIMARY KEY (id),
  CONSTRAINT laundry_store_owner_fkey FOREIGN KEY (owner) REFERENCES public.profiles(id),
  CONSTRAINT laundry_store_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
  );
- CREATE TABLE public.profiles (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  username text,
  full_name text,
  website text,
  updated_at timestamp with time zone,
  id uuid NOT NULL,
  role text,
  collectMethod text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
  );

## 開発ルール

### DB操作

- Supabase の CRUD は必ず `src/app/api/supabaseFunctions/` 配下に書く。ページや components 内に直書きしない。
- RLS が有効なので、ポリシーを意識してクエリを書く。

### セキュリティ（Server Actions）

- **全ての Server Action は自前で認証・認可チェックを行う**。RLS は最終防衛線であり、アプリ層でのチェックが必須。
- `createServiceClient()` は RLS を完全にバイパスするため、使用前に必ず以下を確認すること：
  1. `getUser()` でログイン確認
  2. `getOrgStoreIds()` または `organization_members` クエリで組織境界チェック
- 書き込み・削除系 Action は対象レコードの `laundryId` や `org_id` が自分の組織に属するか事前確認すること。
- `organization_members.role` が権限の正規ソース（`"admin"` / `"collecter"` / `"viewer"`）。`profiles.role` は認可判定に使わない。

### 組織・ロール管理

- ユーザーは1組織に所属する（`organization_members` テーブル）。
- ロールごとの権限：
  - `admin` — 全操作（店舗作成・削除・メンバー管理・集金データ全編集）
  - `collecter` — 集金データの登録・自分のデータ編集・店舗閲覧
  - `viewer` — 閲覧のみ（書き込み系 Action は全てブロック）
- `getOrgStoreIds()` ヘルパーは `getStores()` 経由で組織の全店舗IDを返す。cross-org アクセス防止の基本パターン。

### スタイリング

- **Chakra UI を優先**。`module.css` は Chakra で対応できないレイアウト調整のみ使用。
- 色はハードコードせず、`globals.css` の CSS 変数（`var(--teal)` など）または Chakra の `cyan` トークンを使う。
- 新しい UI を追加する際は、下記「デザインシステム」に定義されたカラー・シェイプ・フォントに従う。

### デザインシステム

現行のビジュアルデザインは「モバイルファースト・現場操作性重視」のティールテーマで統一されている。

#### カラーパレット（`src/app/globals.css` で定義）

| 変数名            | 値          | 用途                             |
| ----------------- | ----------- | -------------------------------- |
| `--teal`          | `#0891B2`   | プライマリカラー（アクセント）   |
| `--teal-dark`     | `#0E7490`   | ホバー・アクティブ状態           |
| `--teal-deeper`   | `#155E75`   | ロゴ・見出しテキスト             |
| `--teal-pale`     | `#CFFAFE`   | 薄い背景・ホバー背景             |
| `--app-bg`        | `#F0F9FF`   | アプリ全体の背景色               |
| `--card-bg`       | `#FFFFFF`   | カード背景                       |
| `--text-main`     | `#1E3A5F`   | メインテキスト                   |
| `--text-muted`    | `#64748B`   | サブテキスト・ラベル             |
| `--text-faint`    | `#94A3B8`   | 非アクティブ・プレースホルダー   |
| `--divider`       | `#F1F5F9`   | 区切り線                         |
| `--shadow-sm`     | `0 2px 12px rgba(8,145,178,0.08)` | カードの影 |
| `--shadow-hero`   | `0 12px 40px rgba(14,116,144,0.28)` | ヒーローカードの影 |

#### フォント

| 用途           | フォント                     |
| -------------- | ---------------------------- |
| UI 全般（日本語含む） | `Noto Sans JP`（Google Fonts） |
| 金額・数値表示 | `Space Mono`（Google Fonts）  |

#### シェイプ・シャドウ

- カード角丸: `border-radius: 18px`（Chakra では `borderRadius="xl"`）
- カードシャドウ: `var(--shadow-sm)` または Chakra `boxShadow="sm"`
- ヒーローカードグラデーション: `linear-gradient(140deg, #0E7490 0%, #0891B2 55%, #06B6D4 100%)`

#### レイアウト原則

- 全体背景: `var(--app-bg, #F0F9FF)`
- コンテンツは白いカード（`var(--card-bg, #FFFFFF)`）でまとめ、間に余白を置く
- タップ領域は最小 `48px × 48px` を確保（集金業務中の片手操作を想定）

#### ナビゲーション

- **トップナビ（PC）**: フロストガラス背景、ロゴ色 `var(--teal-deeper)`、ホバーで `var(--teal-pale)` 背景
- **ボトムナビ（モバイル）**: フロストガラス背景、アクティブタブは `var(--teal-dark)` 色 + ドットインジケーター。`usePathname` でアクティブ状態を自動検出。

#### Chakra UI カラートークンの対応

Chakra UI の props で色を指定するときは `cyan` 系を使う。

```
cyan.50  → ホバー背景（薄い）
cyan.100 → ボーダー
cyan.300 → ホバーボーダー
cyan.900 → ダイアログ見出し
```

#### Chakra UI v3 の注意点

- `focusBorderColor` prop は廃止。代わりに `_focusVisible={{ borderColor: "cyan.400" }}` を使う。
- `leftIcon` / `rightIcon` prop は廃止。アイコンはボタンの children に直接書く。
- `Divider` は `Separator` に変更（またはBoxのborderTopで代替）。

#### グローバルスタイルの注意点

- `globals.css` で `input` / `textarea` の背景色を `#ffffff !important` に固定済み（アプリ背景 `#F0F9FF` との混同防止）。
- スマホのボトムナビ（`position: fixed`）の下にコンテンツが隠れないよう、`layout.module.css` の `.footerWrapper` で `padding-bottom: calc(80px + env(safe-area-inset-bottom))` を付与している。
- `@keyframes fadeSlideUp`（`opacity: 0 + translateY(10px)` → 表示）を `globals.css` に定義済み。チャートなどのフェードイン表示に使う：`style={{ animation: "fadeSlideUp 0.45s ease both" }}`。

---

### モバイルレイアウトの注意点

#### Grid / Flex 子要素のオーバーフロー

- `Grid` / `Flex` の子要素はデフォルトで `min-width: auto` のため、内容物の幅まで膨張してはみ出すことがある。**Grid/Flex 直下の子要素には必ず `minW={0}` を付ける**。

  ```jsx
  <GridItem minW={0}>...</GridItem>
  <Box flex="1" minW={0}>...</Box>
  ```

- 外側コンテナに `overflow="hidden"` を使う場合、内側の `overflow="auto"` なテーブル等も親に合わせてクリップされる点に注意。

#### `position: sticky` と `overflow: hidden` の競合

- CSS の仕様上、**祖先要素に `overflow: hidden/auto/scroll` があると `position: sticky` は効かない**（`position: relative` と同じ挙動になる）。
- モバイルでは sticky は不要なことが多い。`position={{ base: "static", md: "sticky" }}` でスマホのみ外すのが安全。

#### Recharts の注意点

- **`ResponsiveContainer`** は親要素の幅を測定する。親に明示的な幅がないと誤計算が起こる。`width="100%"` かつ `minW={0}` の親で囲むこと。
- **アニメーション**: `isAnimationActive={false}` は原則使わない。棒・折れ線グラフともに 0 から伸びるアニメーションを有効にする標準設定：

  ```jsx
  // Bar
  <Bar isAnimationActive={true} animationBegin={0} animationDuration={700} animationEasing="ease-out" />
  // Line
  <Line isAnimationActive={true} animationDuration={900} animationEasing="ease-out" />
  ```

- **縦棒グラフの YAxis 幅**: 日本語ラベルは 1 文字 ≈ 11〜12px。`Math.min(140, Math.max(72, maxLabelLen * 12 + 8))` のように上限をキャップしてモバイルで棒領域を確保する。

### コンポーネント設計

- コンポーネントは積極的に分割する（1ファイル1責務を意識）。
- 共通UIは `src/components/ui/` に、機能固有UIは `src/app/feacher/<機能名>/` に配置。
- ファイル形式は `.jsx` で統一。TypeScript移行予定なし。
- **React Server Components (RSC) をデフォルト**とする。`useState`・`useEffect`・イベントハンドラが必要な場合のみ `"use client"` を使用する。
  - データフェッチは Server Component で行い、Client Component にはデータをプロパティとして渡す。
  - インタラクティブな部分だけを切り出して Client Component にする（ページ全体を `"use client"` にしない）。

### パフォーマンス

- ページ遷移速度を最優先にする。
- `next/link` による prefetch を活用。重いデータフェッチは Server Component 側で行う。
- 不要な `useEffect` や再レンダリングを避ける。

### コーディングスタイル

- 変数名・関数名に特定の言語規則なし（英語推奨）。
- コメントは日本語でも英語でも可。
- 状態管理はグローバル管理なし（Context API / Zustand は使わない）。各ページのローカル state で管理。

---

## 作業後のフロー

- 機能単位・ファイル単位でこまめにコミットすること。大きな変更をまとめて1コミットにしない。
- 変更を加えたら必ず **git push** すること（Vercel への自動デプロイが走る）。

```bash
git add <変更ファイル>
git commit -m "変更内容を簡潔に"
git push origin main
```

---

## リファクタリング方針

- 勝手にリファクタリングしてよい。
- 大きなコンポーネントは積極的に分割する。
- ただし、DB操作・認証・RLSに関わる変更は動作確認を優先する。

---

## 今後の実装予定

1. ~~**サブスクリプション機能**~~ — 実装済み（Free/Pro/Max・Stripe連携・トライアル14日）
2. ~~**CSV / Excel エクスポート**~~ — 実装済み（Pro以上・期間/店舗フィルタ・月別/店舗別ファイル分割）
3. **集金サイクル管理** — 組織単位のスケジュール設定（毎週曜日 / 毎月日付）とホーム画面カウントダウンは実装済み。未実装：店舗ごとの個別設定・未集金アラート通知
4. **機器故障・メモ記録** — 集金時に気づいた不具合やメモを記録する機能
5. **プッシュ通知 / リマインダー** — 集金タイミングの通知
6. ~~**累計サマリー統計（/collectMoney）**~~ — 実装済み。`StoreRevenueChart`（店舗別累計横棒グラフ）・`MonthlySummaryCard`（月次前月比/前年比テーブル）を `feacher/collectMoney/components/coinDataList/parts/` に追加。データは `getStoreRevenueSummary()`（`totalFunds, laundryName, laundryId` の3カラムのみfetch）でクライアント集計。

---

## 環境変数

`.env.local` に以下を設定（Vercel の環境変数にも同様に設定済み）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=aaabbbcccddddxxxxx.....
SUPABASE_SERVICE_KEY=xxxx...          # サービスロールキー（RLSバイパス用・サーバーのみ）

STRIPE_SECRET_KEY=sk_live_...         # 本番: sk_live_ / 開発: sk_test_
STRIPE_WEBHOOK_SECRET=whsec_...       # Stripe Webhookシークレット
STRIPE_PRO_PRICE_ID=price_...         # ProプランのPrice ID
STRIPE_MAX_PRICE_ID=price_...         # MaxプランのPrice ID
STRIPE_PRO_TRIAL_DAYS=14             # トライアル日数

NEXT_PUBLIC_APP_URL=https://www.collecie.com  # 本番: 公開URL / 開発: http://localhost:3000

RESEND_API_KEY=re_...                 # メール送信（招待メール等）
```

**本番デプロイ時の注意**: `STRIPE_SECRET_KEY` は `sk_live_` キーを使用し、Stripeダッシュボードで本番用Webhookを `https://www.collecie.com/api/stripe/webhook` に登録すること。

---

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm start        # 本番サーバー起動
```
