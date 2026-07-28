# 3. 全体アーキテクチャ

> [← 目次に戻る](README.md)

> **図中の `packages/core` は論理的な呼び名。** 2026-07-27 にモノレポ化を見送ったため、
> 物理的な正本は `coin-laundry-app/src/functions/` にある。配布方法は [4章](04-repo-structure.md) 参照。

```mermaid
graph TB
    subgraph ios["📱 Collecie iOS (Expo / React Native)"]
        UI["Screens<br/>(expo-router)"]
        Q["TanStack Query<br/>+ MMKV Persister"]
        OB["Outbox Queue<br/>(MMKV)"]
        SB["supabase-js<br/>(認証のみ)"]
        UI --> Q
        UI --> OB
        UI --> SB
    end

    subgraph core["📦 packages/core（Web と共有する純粋ロジック）"]
        F["dateRange / makeDate<br/>collectSchedule / monthlySummary<br/>exportData / plans"]
    end

    subgraph vercel["☁️ Vercel hnd1 — Next.js 16"]
        RH["Route Handlers<br/>/api/v1/*<br/>(Bearer JWT 検証)"]
        SA["既存 Server Actions<br/>supabaseFunctions/*"]
        WEB["Web UI (App Router)<br/>※現行のまま無変更"]
        RH --> SA
        WEB --> SA
    end

    subgraph sup["🗄️ Supabase (単一 DB・RLS 有効)"]
        AUTH["Auth<br/>(Email / Google / GitHub / Apple)"]
        PG[("Postgres<br/>organizations, laundry_store,<br/>collect_funds, laundry_state, ...")]
        ST["Storage<br/>Laundry-Images"]
        EF["Edge Function + pg_cron<br/>集金リマインダー"]
    end

    APNS["Apple Push<br/>Notification Service"]

    Q -->|"HTTPS + Bearer"| RH
    OB -->|"POST + Idempotency-Key"| RH
    SB -->|"直接"| AUTH
    SA --> PG
    SA --> ST
    EF --> PG
    EF -->|"Expo Push API"| APNS
    APNS -.->|"通知"| ios

    ios -.->|"利用規約 / プライバシー<br/>は WebView 表示"| WEB
    F -.-> ios
    F -.-> vercel
    F -.-> EF
```

## 各層の責務

| 層 | 責務 | 禁止事項 |
|---|---|---|
| **iOS アプリ** | 表示・入力・オフライン保持・通知受信 | 認可判定を信じない（UI 制御のためだけにロールを使う）。`SUPABASE_SERVICE_KEY` を絶対に持たない |
| **packages/core** | 日付・集計・スケジュール計算などの純粋関数 | DB / React / Node API への依存 |
| **Route Handler** | JWT 検証・入出力の JSON 整形・冪等性制御 | ビジネスロジックを書かない（Server Action に委譲）|
| **Server Action** | 認証・認可・DB 操作（**唯一の正**）| — |
| **RLS** | 最終防衛線 | ここだけに頼らない |

---

**関連章**: [2. 認可ロジックの配置](02-authz-decision.md) / [4. リポジトリ構成](04-repo-structure.md) / [6. API 層設計（BFF）](06-api-bff.md)
