# 14. 実装フェーズ

> [← 目次に戻る](README.md)

各フェーズの終わりに **`npm test` と `npm run build` が通ること**を完了条件とする（`CLAUDE.md` 作業後フロー）。

## Phase 0 — 基盤整備（Web 側 / 1〜2 週）

> **この時点ではまだアプリのコードを 1 行も書かない。** Web を壊さないことを最優先に、土台だけ整える。

- [x] ~~モノレポ化（`apps/web` / `packages/core`）~~ → **2026-07-27 に見送り。2 リポジトリ体制とする**（[4章](04-repo-structure.md)）
- [x] `src/utils/supabase/server.js` に Bearer トークン対応を追加（[2章 認可ロジックの配置](02-authz-decision.md)）
- [x] `middleware.js` の matcher から `/api/v1` を除外（Cookie 前提の `updateSession` を通さない）
- [x] `withAuth()` ラッパー + `/api/v1/bootstrap` `/api/v1/stores` を実装し、curl で疎通確認
- [ ] **有効な access_token での 200 応答を確認**（テストアカウントが必要）
- [ ] DB マイグレーション：`client_request_id` / `device_tokens` / `notification_prefs` / 複合インデックス
- [x] **Web の全機能が無変更で動くことを回帰確認** — `npm test` 102 件全通 / `npm run build` 成功 / `/` 200 / `/settings` 307 リダイレクト維持

> **検証メモ**：`global.headers.Authorization` を渡すと supabase-js が `hasCustomAuthorizationHeader` を立て、
> `auth.getUser()` がセッションではなくヘッダの JWT を検証する（supabase-js 2.58.0 / auth-js `GoTrueClient.js:1205` で確認）。
> 不正な JWT を送ると Supabase 側が `invalid JWT` を返すため、ヘッダが実際に到達していることを確認済み。

## Phase 1 — 読み取り専用アプリ（3〜4 週）

- [x] Expo プロジェクト作成（SDK 57 / expo-router / TypeScript）/ デザイントークン移植
- [ ] EAS 設定（`eas.json` / 開発ビルド）— **Apple Developer Program の取得待ち**
- [x] 認証（メール + パスワード）、`LargeSecureStore` によるセッション永続化
- [x] Sign in with Apple の実装 — **Supabase 側の Apple provider 有効化待ちで未検証**
- [x] タブナビゲーション（組織未所属は 2 タブ）+ ホーム + 店舗一覧 + 店舗詳細 + 設定
- [x] TanStack Query + MMKV による読み取りキャッシュ（永続化込み）
- [x] BFF に `/api/v1/home` と `/api/v1/stores/:id` を追加
- [ ] **TestFlight 内部配布 →** 実機・実店舗で電波状況を確認

### 移植時に判明したライブラリの差分

- **react-native-mmkv は v4 で API が変わっている。** `new MMKV()` は使えず `createMMKV()`、
  `storage.delete(key)` は `storage.remove(key)`。設計図 12 章のサンプルは v2/v3 想定なので注意。
- **`@expo/vector-icons` は SDK 57 では自動で入らない。** 明示的にインストールが必要。
- **react-dom のバージョン競合。** expo-router が引き込む react-dom が react より新しく
  `ERESOLVE` になる。`npx expo install react-dom` で react と揃えて解消する。

## Phase 2 — 集金入力（3〜4 週・ここが本体）

- [x] 集金入力画面（カスタムキーパッド・重量換算・ハプティクス）
- [x] Draft 自動保存（1.5 秒 debounce / MMKV）+ Outbox（FIFO・指数バックオフ・上限 50 件）
- [x] 冪等性（`Idempotency-Key` → `client_request_id`、23505 を成功扱い）
- [ ] **DB マイグレーションの適用** — `docs/ios/migrations/001_mobile_foundation.sql` を Supabase で実行する。**未適用だと集金登録が失敗する**
- [x] 売上履歴（無限スクロール）+ 店舗別累計
- [ ] グラフ（victory-native）— 未着手
- [x] 在庫 / 設備の閲覧・更新（オフライン時は無効化）
- [ ] **機内モードでの一連の操作を E2E（Maestro）で検証** — 実機が必要

### Outbox の実装メモ

- 送信は 1 件ずつ直列。オフラインを検知した時点で残りは打ち切り、次のトリガに回す
- 4xx（409 除く）は `failed` にして UI に残す。自動再送しない
- 409 と「同じキーで既に登録済み」は成功として破棄する
- 24 時間送れなかったものは自動再送を止め、ユーザーの判断を仰ぐ
- 在庫・設備の更新は **Outbox 対象外**（設計図 9.3 の決定どおり）。オフライン時はボタンを無効化する

## Phase 3 — 設定・通知・審査準備（2〜3 週）

- [ ] 設定タブ全般、組織メンバー管理、集金スケジュール設定
- [ ] プッシュ通知（Edge Function + pg_cron + 許可プライミング）
- [ ] **アカウント削除 API + UI**（審査必須）
- [ ] プラン read-only 表示 + **文言レビュー**（外部購入への言及がないこと）
- [ ] Privacy Manifest / スクリーンショット / 審査用アカウント
- [ ] Sentry 導入

## Phase 4 — 提出・v1.1

- [ ] App Store 提出
- [ ] v1.1: CSV / Excel エクスポート（サーバ生成 + 共有シート）、Face ID ロック、店舗写真のカメラ撮影

---

**関連章**: [4. リポジトリ構成](04-repo-structure.md) / [13. App Store 審査対応](13-app-review.md) / [15. リスクと未決事項](15-risks.md)
