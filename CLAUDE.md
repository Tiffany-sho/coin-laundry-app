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
│   │   ├── partials/               # レイアウト共通部品（Navbar, Footer等）
│   │   ├── coinLandry/             # 店舗関連UI
│   │   ├── collectMoney/           # 集金関連UI
│   │   ├── dialog/                 # ダイアログ群
│   │   └── ...
│   ├── coinLaundry/                # 店舗ページ（一覧・詳細・新規）
│   ├── collectMoney/               # 集金ページ
│   ├── auth/                       # 認証ページ
│   └── account/                    # アカウントページ
├── components/
│   └── ui/                         # 汎用UIコンポーネント（Chakra UI拡張）
├── functions/                      # ユーティリティ関数
└── seeds/                          # シードデータ
```

---

## DB_SQL

- CREATE TABLE public.action_message (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  message text,
  date bigint,
  user uuid DEFAULT auth.uid(),
  CONSTRAINT action_message_pkey PRIMARY KEY (id),
  CONSTRAINT action_message_user_fkey FOREIGN KEY (user) REFERENCES public.profiles(id)
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
  laundryId uuid DEFAULT gen_random_uuid(),
  detergent bigint,
  softener bigint,
  machines jsonb,
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
  CONSTRAINT laundry_store_pkey PRIMARY KEY (id),
  CONSTRAINT laundry_store_owner_fkey FOREIGN KEY (owner) REFERENCES public.profiles(id)
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

---

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

1. **集金時の一時データ保存** — 集金途中のデータをローカルまたはDBに一時保存
2. **役割・権限管理** — 管理者 / 集金担当者 / 閲覧者などのロール追加
3. **サブスクリプション機能** — 有料プランによる機能制限

---

## 環境変数

`.env.local` に以下を設定（Vercel の環境変数にも同様に設定済み）:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=aaabbbcccddddxxxxx.....
```

---

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm start        # 本番サーバー起動
```
