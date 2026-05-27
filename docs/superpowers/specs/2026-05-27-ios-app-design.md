# Collecie iOS アプリ 設計書

**作成日**: 2026-05-27  
**対象**: Swift / SwiftUI iOSネイティブアプリ  
**既存バックエンド**: Supabase（Webアプリと共有）

---

## 1. 概要

コインランドリー集金管理アプリ「Collecie」のiOSネイティブアプリ。  
既存のWebアプリ（Next.js + Supabase）と同一のSupabaseバックエンドを共有し、全ロール（admin / collecter / viewer）に対応したフル機能パリティを実現する。

### 要件サマリー

| 項目 | 内容 |
|------|------|
| 対象OS | iOS 17.0+ |
| UIフレームワーク | SwiftUI + @Observable |
| アーキテクチャ | MVVM + Repository層 |
| バックエンド | Supabase Swift SDK（Webアプリと共有） |
| オフライン対応 | 集金データ入力のみ（SwiftDataにドラフト保存→オンライン復旧時に自動送信） |
| プッシュ通知 | APNs + Supabase Edge Functions |
| 課金 | 将来拡張（StoreKit 2、SettingsViewに差し込み口を確保） |

---

## 2. アーキテクチャ

### 採用パターン: MVVM + Repository

```
View (SwiftUI)
  ↕ @Observable ViewModel
Repository層（オンライン/オフライン透過的切り替え）
  ├── Supabase Swift SDK（Auth / Database / Storage / Realtime）
  └── SwiftData（ローカルオフラインストア）
```

- **View**: SwiftUI の宣言的UI。@Observable ViewModel をバインド。
- **ViewModel**: 各画面の状態を保持。ネットワーク状態を直接知らない。
- **Repository層**: オンライン/オフラインの切り替えをカプセル化。ViewModelはRepositoryのasync関数を呼ぶだけ。
- **Services**: Supabase初期化・APNs・ネットワーク監視をシングルトンで管理。

### Webアプリとの対応

| Webアプリ | iOSアプリ |
|-----------|-----------|
| `src/app/feacher/` | `Features/` |
| `src/components/ui/` | `Components/` |
| `src/app/api/supabaseFunctions/` | `Repositories/` + `Services/SupabaseService` |
| Server Actions (`"use server"`) | Repository層の async 関数 |
| Context API / props | @Observable ViewModel |
| CSS変数 (`var(--teal)`) | `Color` extension（`Color.teal` 等） |

---

## 3. ナビゲーション構造

### 認証フロー（未ログイン時）

```
LaunchScreen
  └─ LoginView
       ├─ SignupView
       ├─ ForgotPasswordView
       └─ InviteAcceptView（招待URL ディープリンク: collecie://invite?token=xxx）
```

### メインアプリ（ログイン後）— TabView 4タブ

#### 🏠 ホームタブ
```
HomeView
  ├─ 当月集金合計・前月比
  ├─ 店舗別サマリーリスト
  └─ アクションメッセージログ
```

#### 🏪 店舗タブ
```
StoreListView
  └─ StoreDetailView
       ├─ CollectHistoryView
       │    └─ CollectDetailView
       ├─ MachineStateView（機器状態・在庫管理）
       └─ StoreEditView
  └─ StoreNewView（admin のみ表示）
```

#### 💰 集金タブ
```
CollectListView（全店舗の集金一覧）
  ├─ CollectNewView（機械別 or まとめて入力 — オフライン対応）
  └─ CollectEditView
```

#### ⚙️ 設定タブ
```
SettingsView
  ├─ AccountEditView
  ├─ OrgSettingsView（admin のみ表示）
  │    ├─ MemberListView
  │    │    └─ InviteView
  │    ├─ InvitationListView
  │    └─ NotificationSettingsView（集金リマインダーの周期・有効無効）
  ├─ AppSettingsView（集金方法 / ダークモード）
  └─ LogView
```

### ロール制御
- `(admin)` 専用画面・ボタンはログイン時のロール判定で非表示
- `RoleBasedView` コンポーネントでラップして制御

---

## 4. データ層

### SwiftData モデル（ローカルオフラインストア）

```swift
@Model class PendingCollect {
    var id: UUID
    var storeId: UUID
    var storeName: String
    var date: Int64
    var fundsArray: Data      // JSON エンコード済み
    var totalFunds: Int64
    var createdAt: Date
    var syncStatus: SyncStatus  // .pending / .syncing / .failed
}

@Model class CachedStore {
    var id: UUID
    var name: String
    var location: String
    var machines: Data        // JSON エンコード済み
    var cachedAt: Date
}

@Model class UserPreferences {
    var collectMethod: String  // "machines" | "total"
    var darkMode: Bool
}
```

### オフライン同期フロー（CollectNew）

```
ユーザーが集金データを入力・送信
  ↓
ネットワーク確認（NetworkMonitor）
  ├─ オンライン  → Supabase に直接 INSERT → 完了
  └─ オフライン → SwiftData に PendingCollect として保存
                   → OfflineBanner をUI表示
                   → NetworkMonitor がオンライン復旧を検知
                   → PendingCollect を順次 Supabase に送信
                   → 成功後 SwiftData から削除
```

### Repository 一覧

| Repository | 主な責務 |
|-----------|----------|
| `AuthRepository` | ログイン / サインアップ / パスワードリセット / ログアウト |
| `StoreRepository` | 店舗CRUD・画像アップロード（Supabase Storage） |
| `CollectRepository` | 集金CRUD・オフライン同期 |
| `InventoryRepository` | 在庫・機器状態CRUD・アラート判定 |
| `ProfileRepository` | プロフィール・組織・メンバー管理 |

---

## 5. DBスキーマ変更（Web・iOS共通）

iOSアプリ対応に伴い、以下のスキーマ変更が必要。

### 5-1. `laundry_state` — 在庫をJSONBに移行

**現在:**
```sql
detergent bigint,
softener  bigint,
```

**変更後:**
```sql
inventory jsonb DEFAULT '[]'::jsonb,
-- detergent / softener カラムを廃止
```

`inventory` の各要素:
```json
{ "id": "det", "name": "洗剤", "quantity": 80, "unit": "%", "threshold": 20 }
```

- `threshold` で在庫ごとに通知閾値を個別設定可能
- 種類の追加・削除・名前変更がアプリ内でできる
- **マイグレーション**: 既存の `detergent`/`softener` 値を `inventory` JSONBに変換するSQLマイグレーションを作成する

### 5-2. `laundry_state.machines` — 故障フラグ追加

既存の `machines` JSONB配列の各要素に `hasFault` フラグを追加:
```json
{ "id": "w1", "name": "洗濯機1", "status": "normal", "hasFault": false }
```

### 5-3. `device_tokens` — 新規テーブル追加

```sql
CREATE TABLE public.device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text DEFAULT 'ios',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);
```

- ログイン時に UPSERT、ログアウト時に DELETE
- RLS: 自分の行のみ読み書き可能

---

## 6. プッシュ通知

### アーキテクチャ

```
iOSアプリ（APNsトークン取得）
  → Supabase DB（device_tokens に保存）
  → Supabase Edge Function（APNs JWT認証で通知送信）
```

Edge Function は Deno（TypeScript）で実装。APNs認証はp8キー（JWT方式）を使用。

### 通知6種

| 通知タイプ | トリガー | 対象ロール |
|-----------|---------|-----------|
| 💰 集金リマインダー | Cron（OrgSettingsViewでadminが周期を設定） | collecter / admin |
| ✅ 集金完了通知 | `collect_funds` INSERT — DB Webhook | admin |
| 🧴 在庫不足アラート | `laundry_state` UPDATE — DB Webhook（`inventory[].quantity <= threshold`） | collecter / admin |
| ⚠️ 設備異常アラート | `laundry_state` UPDATE — DB Webhook（`machines[].hasFault` が true に変化） | collecter / admin |
| 👤 メンバー参加通知 | `organization_members` INSERT — DB Webhook | admin |
| 📩 招待送信確認 | `inviteMember` 呼び出し時 | admin（本人） |

---

## 7. Xcodeプロジェクト構成

```
Collecie/
├── App/
│   ├── CollecieApp.swift       # エントリポイント・SwiftData container 初期化
│   └── AppRouter.swift         # 認証状態でRoot画面を切り替え
├── Features/                   # 機能別（Webの feacher/ に対応）
│   ├── Auth/
│   ├── Home/
│   ├── Store/
│   ├── Collect/
│   ├── MachineState/
│   └── Settings/
├── Repositories/
│   ├── AuthRepository.swift
│   ├── StoreRepository.swift
│   ├── CollectRepository.swift # オフライン同期ロジックを含む
│   ├── InventoryRepository.swift
│   └── ProfileRepository.swift
├── Models/
│   ├── SwiftData/              # PendingCollect / CachedStore / UserPreferences
│   └── DTO/                    # CollectFund / Store / Profile / InventoryItem / Machine
├── Services/
│   ├── SupabaseService.swift   # SDK初期化・シングルトン
│   ├── NotificationService.swift # APNsトークン登録・通知ハンドリング
│   └── NetworkMonitor.swift    # オンライン/オフライン監視（Network framework）
└── Components/                 # 再利用UIパーツ（Webの components/ui/ に対応）
    ├── RoleBasedView.swift      # ロール判定ヘルパー
    ├── OfflineBanner.swift
    └── Charts/                 # Swift Charts ラッパー
```

---

## 8. 将来拡張

- **サブスクリプション（StoreKit 2）**: `SettingsView` に課金管理画面を差し込む。`profiles.subscriptionStatus` をWebとiOS共通で参照。
- **Realtime**: Supabase Swift SDKのRealtime機能で集金データをリアルタイム反映（現在はpull型）。
- **Android対応**: バックエンドはSupabaseで共通のため、Kotlin/Composeでの実装が可能。

---

## 9. 実装の注意点

- **認証**: Supabase Auth の JWT をキーチェーンに保存。アプリ再起動時にセッションを自動復元。
- **ディープリンク**: 招待URL（`collecie://invite?token=xxx`）を Info.plist に URL Scheme として登録。
- **画像アップロード**: Supabase Storage の既存バケットをWebアプリと共有。iOSからは `UIImagePickerController` / `PhotosUI` で撮影・選択。
- **セキュリティ**: Repository層でも認証・組織境界チェックを実施（Webアプリの Server Actions と同等のロジック）。RLSは最終防衛線として機能。
- **カラーパレット**: WebアプリのCSS変数（`var(--teal)` = `#0891B2` 等）をSwiftUIの `Color` extensionとして定義し、ブランドカラーを統一。
