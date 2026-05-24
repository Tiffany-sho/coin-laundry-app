# Collecie — 再構築設計ドキュメント

> このドキュメントは現行アプリ（coin-laundry-app）の知見をもとに、新リポジトリでの再構築を想定して作成した設計資料です。

---

## 1. アプリ構成

### 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 14+ (App Router) |
| バックエンド/DB/認証 | Supabase (PostgreSQL, Auth, Storage, RLS) |
| デプロイ | Vercel |

### アーキテクチャ方針

- **React Server Components をデフォルト**とし、`useState` / `useEffect` / イベントハンドラが必要な箇所のみ `"use client"` を付与する
- **データフェッチは Server Component** で行い、Client Component にはプロパティとして渡す
- **DB操作（CRUD）は Server Actions** に集約し、ページや components 内に直書きしない
- **日付は `timestamptz` で統一**し、UTC で保持・JST 変換はフロントのみで行う
- **金額は円単位の `bigint`** で統一し、変換ロジックを持たない
- **RLS は `organization_members` ベース**で設計し、Service Client の使用を最小限にする


### 役割と権限

| 操作 | admin | collecter | viewer |
|------|:-----:|:---------:|:------:|
| 店舗作成・編集・削除 | ✓ | — | — |
| 機器追加・削除 | ✓ | — | — |
| 機器状態更新（故障フラグ）| ✓ | ✓ | — |
| 集金記録・編集（自分のみ）| ✓ | ✓ | — |
| 集金記録編集（全員分） | ✓ | — | — |
| 在庫数更新 | ✓ | ✓ | — |
| 在庫種別追加・削除 | ✓ | — | — |
| メンバー管理・招待 | ✓ | — | — |
| 閲覧全般 | ✓ | ✓ | ✓ |

---

## 2. DB構成

### テーブル一覧

| テーブル | 概要 |
|----------|------|
| `profiles` | ユーザー情報・設定 |
| `organizations` | 組織マスタ |
| `organization_members` | 組織メンバー（役割管理） |
| `organization_invitations` | 招待トークン管理 |
| `laundry_store` | 店舗マスタ |
| `machines` | 機器定義・状態（旧: `laundry_store.machines` JSONB + `laundry_state` を統合） |
| `inventory_types` | 在庫種別マスタ（組織ごとにカスタム可） |
| `laundry_inventory` | 店舗ごとの在庫数量 |
| `collect_funds` | 集金記録 |
| `action_message` | 操作ログ |

**廃止テーブル（現行からの変更）**
- `laundry_state` — `machines` テーブルと `laundry_inventory` に役割を分離したため廃止

### テーブル定義

#### `profiles`
```sql
CREATE TABLE public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name           text,
  username            text,
  phone_number        text,
  avatar_url          text,
  notification_email  text,
  role                text,             -- admin | collecter | viewer
  collect_method      text,             -- machines | total | null
  track_denominations boolean NOT NULL DEFAULT false,
  collection_cycle    text,             -- weekly | monthly | null
  updated_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);
```

#### `organizations`
```sql
CREATE TABLE public.organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  owner_id   uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### `organization_members`
```sql
CREATE TABLE public.organization_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL,             -- admin | collecter | viewer
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
```

#### `organization_invitations`
```sql
CREATE TABLE public.organization_invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email        text NOT NULL,
  invite_token text NOT NULL UNIQUE,
  role         text NOT NULL,
  inviter_id   uuid NOT NULL REFERENCES auth.users(id),
  expires_at   timestamptz NOT NULL,
  accepted_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

#### `laundry_store`
```sql
CREATE TABLE public.laundry_store (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id        uuid NOT NULL REFERENCES auth.users(id),
  name            text NOT NULL,
  location        text NOT NULL,
  description     text NOT NULL,
  images          jsonb NOT NULL DEFAULT '[]',  -- [{path, url}]
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

#### `machines`
```sql
-- 機器定義と状態を1テーブルで管理
-- 旧: laundry_store.machines(JSONB) + laundry_state.machines(JSONB) + laundry_state テーブルを統合
CREATE TABLE public.machines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laundry_id  uuid NOT NULL REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  name        text NOT NULL,
  unit_count  integer NOT NULL DEFAULT 1,       -- 台数
  is_broken   boolean NOT NULL DEFAULT false,
  comment     text,
  sort_order  integer NOT NULL DEFAULT 0,
  updated_by  uuid REFERENCES auth.users(id),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

#### `inventory_types`
```sql
-- 組織ごとにカスタマイズ可能な在庫種別マスタ
CREATE TABLE public.inventory_types (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,           -- 洗剤, 柔軟剤, ゴミ袋 など
  unit            text NOT NULL DEFAULT '個', -- 袋, 本, 個 など
  alert_threshold integer NOT NULL DEFAULT 2, -- この値未満で低在庫アラート
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);
```

#### `laundry_inventory`
```sql
-- 店舗ごとの在庫数量（inventory_types × laundry_store の交差テーブル）
CREATE TABLE public.laundry_inventory (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laundry_id        uuid NOT NULL REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  inventory_type_id uuid NOT NULL REFERENCES public.inventory_types(id) ON DELETE CASCADE,
  quantity          integer NOT NULL DEFAULT 0,
  updated_by        uuid REFERENCES auth.users(id),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (laundry_id, inventory_type_id)
);
```

#### `collect_funds`
```sql
CREATE TABLE public.collect_funds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laundry_id   uuid NOT NULL REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  collected_at timestamptz NOT NULL,
  total_funds  bigint NOT NULL,             -- 円単位
  funds_array  jsonb NOT NULL DEFAULT '[]', -- 後述
  collector_id uuid NOT NULL REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

**`funds_array` の構造**

```jsonc
// track_denominations = false（合計のみ）
[{ "machine_id": "uuid", "name": "洗濯機1", "amount": 5400 }]

// track_denominations = true（金種別内訳あり）
[{
  "machine_id": "uuid",
  "name": "洗濯機1",
  "amount": 5400,
  "denominations": { "10": 0, "50": 2, "100": 30, "500": 6, "1000": 1 }
}]
// amount は denominations の合計と一致させる
// 1円・5円は除外（コインランドリーで現実的に発生しない）
```

#### `action_message`
```sql
CREATE TABLE public.action_message (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_id      uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  message     text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
```

### Storage

| バケット | パス | 用途 |
|----------|------|------|
| `laundry-images` | `laundry/{filename}` | 店舗写真 |

### ER図

```
auth.users
  └── profiles (1:1)

organizations
  ├── organization_members     (org_id, user_id, role)
  ├── organization_invitations (org_id, inviter_id, invite_token)
  ├── inventory_types          (org_id)
  └── laundry_store            (organization_id, owner_id)
       ├── machines             (laundry_id)        ← 定義+状態を統合
       ├── laundry_inventory    (laundry_id, inventory_type_id)
       └── collect_funds        (laundry_id, collector_id)

action_message (actor_id → profiles, org_id → organizations)
```

### RLSポリシー設計方針

すべてのテーブルで `organization_members` を参照するポリシーで統一する。

```sql
-- 閲覧: 同じ組織のメンバーなら参照可
CREATE POLICY "org_member_select" ON laundry_store
  FOR SELECT USING (
    organization_id IN (
      SELECT org_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- 書き込み: admin または collecter のみ
CREATE POLICY "admin_collecter_insert" ON collect_funds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'collecter')
    )
  );

-- 書き込み: admin のみ
CREATE POLICY "admin_only_insert" ON laundry_store
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

Service Client（RLS バイパス）は原則使用しない。Webhook など認証ユーザーが存在しない Server Action に限定する。

---

## 3. 設計プラン

### Phase 1: 基盤セットアップ

1. Supabase プロジェクト作成
   - 全テーブル作成（上記 SQL）
   - RLS ポリシー設定
   - Storage バケット作成
2. Next.js プロジェクト初期化
   - App Router, Supabase SSR（`@supabase/ssr`）セットアップ
   - `middleware.js` で保護ルート設定
3. 認証フロー実装
   - ログイン / 新規登録 / パスワードリセット
   - `auth/callback` ルート（メール確認）
4. 初回プロフィール登録
   - `role` 選択 → admin なら組織を自動作成 → `organization_members` に追加

### Phase 2: 店舗・機器管理

1. `laundry_store` CRUD（admin のみ作成・編集・削除）
   - 店舗作成時に `machines` と `laundry_inventory` を自動初期化
2. `machines` CRUD
   - 機器の追加・削除（admin）
   - 機器状態更新（`is_broken`, `comment`）（admin / collecter）
   - 機器削除時は `collect_funds.funds_array` 内の参照は残す（履歴保持）
3. Supabase Storage 画像アップロード・削除

### Phase 3: 在庫管理

1. `inventory_types` CRUD（admin）
   - 組織単位で種別を追加・削除・並び替え
   - 種別追加時は既存全店舗の `laundry_inventory` に quantity=0 で自動追加
2. `laundry_inventory` 更新（admin / collecter）
   - 低在庫アラート（`quantity < alert_threshold`）

```sql
-- 低在庫クエリ
SELECT ls.name AS store_name, it.name, li.quantity, it.alert_threshold, it.unit
FROM laundry_inventory li
JOIN laundry_store ls ON ls.id = li.laundry_id
JOIN inventory_types it ON it.id = li.inventory_type_id
WHERE li.quantity < it.alert_threshold
  AND ls.organization_id = $org_id;
```

### Phase 4: 集金記録（コア機能）

1. `collect_funds` CRUD
   - 作成・取得・編集・削除
   - 権限: collecter は自分の記録のみ編集・削除可、admin は全記録
2. 2種の入力モード実装
   - machines モード: 機器ごとに金額入力
   - total モード: 合計のみ入力
3. 金種別入力（`track_denominations = true` のユーザー向け）
   - `denominations` フィールドを `funds_array` に追加
   - 金種の合計と `amount` の一致バリデーション
4. localStorage ドラフト保存（キー: `draft_collect_{storeId}`）

### Phase 5: 組織・メンバー管理

1. 招待フロー
   - admin がメールアドレス + 役割を指定して `invite_token` を生成（7日有効）
   - `/auth/invite/[token]` で承認 → `organization_members` に追加
2. メンバー一覧・役割変更・削除（admin）
3. 招待一覧・キャンセル（admin）

### Phase 6: 集計・ダッシュボード

1. 当月 / 前月 / 指定期間の売上集計

```sql
-- 月別集計（DB側でJST変換）
SELECT
  date_trunc('month', collected_at AT TIME ZONE 'Asia/Tokyo') AS month,
  SUM(total_funds) AS total
FROM collect_funds
WHERE laundry_id = $laundry_id
GROUP BY month
ORDER BY month;
```

2. 店舗別・組織横断の集計
3. ページネーション（`LIMIT` / `OFFSET` または `range(from, to)`）
4. チャート用データ整形（Recharts 向け）

### Phase 7: 補助機能

1. アクションログ（`action_message`）の記録・表示
2. 故障中機器アラート（ホーム画面）
3. 低在庫アラート（ホーム画面）
4. プロフィール更新（`phone_number`, `avatar_url`, `notification_email` 等）

---

## 4. 現行アプリからの主な変更点まとめ

| 項目 | 現行 | 再構築後 |
|------|------|----------|
| 機器管理 | `laundry_store.machines`（JSONB）+ `laundry_state.machines`（JSONB） | `machines` テーブルに統合 |
| 機器状態管理 | `laundry_state` テーブル | `machines.is_broken` / `machines.comment` |
| 在庫管理 | `laundry_state.detergent` / `softener`（固定2種） | `inventory_types` + `laundry_inventory`（種別追加可） |
| 日付型 | `bigint`（エポックms）+ JST補正定数 | `timestamptz`（UTC保持、フロントでJST変換） |
| 金額単位 | 100円単位整数 | 円単位整数 |
| 非正規化カラム | `collect_funds.laundryName`, `laundry_state.laundryName` | 廃止、JOIN で取得 |
| カラム命名 | camelCase混在 | snake_case 統一 |
| RLS | Service Client バイパス多用 | `organization_members` ベースで統一 |
