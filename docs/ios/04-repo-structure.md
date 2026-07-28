# 4. リポジトリ構成

> [← 目次に戻る](README.md)

> **2026-07-27 決定：モノレポ化しない。** 当初案は現行リポジトリを npm workspaces のモノレポへ変換するものだったが、
> R1（移行途中に本番 Web が壊れる）を回避するため、**2 リポジトリ体制**を採る。
> 旧案は末尾の [参考：見送ったモノレポ案](#参考見送ったモノレポ案) に残す。

## 2 リポジトリ体制

```
dev/
├── coin-laundry-app/            # Web + BFF（既存リポジトリ・構成は変えない）
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── v1/          # ★新規: モバイル向け Route Handlers
│   │   │   │       ├── _lib/handler.js      # withAuth() 共通ラッパー
│   │   │   │       ├── bootstrap/route.js
│   │   │   │       └── stores/route.js
│   │   │   └── ...              # 既存ページ（無変更）
│   │   ├── functions/           # 純粋関数。★移設しない。ここが正本
│   │   ├── middleware.js        # matcher から /api/v1 を除外
│   │   └── utils/supabase/
│   │       └── server.js        # ★Bearer 対応を追加（唯一の改修点）
│   ├── docs/ios/                # ★この設計図（正本）
│   ├── next.config.mjs
│   └── vercel.json              # regions: ["hnd1"]
│
└── coinlaundy_app_iOS/          # ★Expo アプリ（別リポジトリ）
    ├── app/                     # expo-router（ファイルベースルーティング）
    ├── src/
    │   ├── api/                 # BFF クライアント（fetch ラッパー）
    │   ├── components/          # 汎用 UI（Card, Button, MoneyText …）
    │   ├── features/            # 機能別（web の feacher/ と対応させる）
    │   ├── theme/               # デザイントークン（globals.css の移植）
    │   ├── offline/             # Outbox / Draft ストア
    │   ├── shared/              # ★共有ロジックの取り込み先（方式は未定）
    │   └── hooks/
    ├── app.json
    └── eas.json
```

### この構成の意味

- **`coin-laundry-app` の構成は一切変えない。** `src/` の移設も `package.json` の workspaces 化も行わない。追加されるのは `src/app/api/v1/` と、`server.js` / `middleware.js` への加算的な変更だけ。既存の Vitest スイートと import パス（`@/functions/...`）はそのまま。
- **Vercel のデプロイ設定も無変更。** ルートディレクトリが動かないため、既存のビルド設定・環境変数がそのまま効く。
- **iOS アプリは完全に独立して開発できる。** Expo の Metro バンドラが Web のソースを見に行かないので、依存解決の衝突が起きない。

## 共有する純粋ロジック

設計図の他章に出てくる `packages/core` は、**論理的な「共有純粋ロジック層」の呼び名**として読むこと。物理的な正本は現行どおり `coin-laundry-app/src/functions/` にある。

| ファイル | 内容 | RN から使うか |
|---|---|---|
| `dateRange.js` | `applyDateRange` / `END_INCLUSIVE` | サーバのみ（アプリは epoch を渡すだけ）|
| `makeDate/date.js` | `getEpochTimeInSeconds` ほか | **使う**（JST 正規化に必須）|
| `collectSchedule.js` | `getNextCollectDate` | **使う**（集金カウントダウン）|
| `monthlySummary.js` | 月次サマリー | サーバのみ |
| `exportData.js` / `csvExport.js` | エクスポート整形 | サーバのみ（v1.1）|
| `xlsxExport.js` | Excel 生成 | **使わない**（`write-excel-file/node` 依存）|
| `plans.js` | `PLAN_LIMITS` / `PLAN_NAMES` | **使う**（プラン read-only 表示）|
| （新規）`collectMoney.js` | `coinWeight = 4.8` ほか | **使う**（重量 → 枚数換算）|

### ⚠️ 配布方法は未定

2 リポジトリに分かれたことで、`makeDate` / `collectSchedule` / `plans` を Expo 側へ届ける手段を決める必要がある。**Phase 1 着手時に確定させること。**

| 方式 | 利点 | 欠点 |
|---|---|---|
| **コピー + テスト同梱** | 最も単純。Metro の設定不要 | 手動同期。ずれたことに気づけない → 同じ Vitest スイートを両リポジトリで走らせて検知する |
| **git submodule** | 履歴が 1 本。ずれない | submodule の更新忘れが起きやすい。CI が複雑になる |
| **private npm パッケージ** | 依存として正しく管理できる | レジストリの用意とバージョン運用のコストが要る |

> Deno（Edge Function）から参照する場合はさらに別問題。[10章](10-push.md) の `getNextCollectDate()` 再利用は、この配布方法が決まるまで着手できない。

---

## 参考：見送ったモノレポ案

以下は 2026-07-27 に**見送った**当初案。将来 2 リポジトリ体制の同期コストが問題になった場合に再検討する。

```
coin-laundry-app/
├── package.json                 # workspaces: ["apps/*", "packages/*"]
├── apps/
│   ├── web/                     # ← 現行 src/ をここへ移設（中身は無変更）
│   └── mobile/                  # Expo アプリ
└── packages/
    └── core/                    # 現行 src/functions/ を移設
```

- 利点：共有ロジックが 1 箇所に収まり、ずれが原理的に起きない
- 欠点：移設中に本番 Web を壊すリスク（R1）。全画面の回帰テストが必要
- 判断：**アプリがまだ 1 行も存在しない段階でこのリスクを取る理由がない。** アプリが動き、共有ロジックの同期が実際に痛くなってから移行しても遅くない

---

**関連章**: [3. 全体アーキテクチャ](03-architecture.md) / [14. 実装フェーズ](14-phases.md) / [付録: 既存コード対応表](99-mapping.md)
