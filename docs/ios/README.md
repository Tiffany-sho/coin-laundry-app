# Collecie iOS 設計図 — 目次

> 対象: コインランドリー集金アプリ「Collecie」の iOS ネイティブアプリ版
> 前提: **DB は現行 Supabase をそのまま共有**（スキーマ変更は追加のみ）
> 方式: **React Native / Expo**、**アプリ内課金なし（プラン表示は read-only）**
> 作成日: 2026-07-27 / 最終更新: 2026-07-27

本体は章ごとに分割されている。**必要な章だけを読むこと。**

---

## 決定事項ログ

設計図の記述より**こちらが優先**する。

| 日付 | 決定 | 影響する章 |
|---|---|---|
| 2026-07-27 | **モノレポ化しない。** `coin-laundry-app`（Web + BFF）と `coinlaundy_app_iOS`（Expo アプリ）の 2 リポジトリ体制とする。R1（モノレポ移行で本番 Web が壊れる）を回避するため | [4章](04-repo-structure.md) |
| 2026-07-27 | 設計図の正本を `coin-laundry-app/docs/ios/` に置く。iOS リポジトリ側は参照リンクのみ | — |
| 2026-07-27 | 15章の未決事項 6 件をすべて**推奨案どおりに確定** | [15章](15-risks.md) |
| 2026-07-27 | Phase 0 のうち **Bearer 対応 + `/api/v1` 疎通まで**を先行実装（モノレポ化と DB マイグレーションは分離） | [14章](14-phases.md) |
| 2026-07-27 | **共有ロジックはコピー運用**とする。`src/shared/` に置き、ファイル冒頭に「Web と同時に直すこと」を明記。submodule / private npm はアプリが動いてから再検討 | [4章](04-repo-structure.md) |
| 2026-07-29 | **13.1 の「プランは read-only 表示のみ」を撤回し、アプリ内課金（StoreKit の自動更新サブスクリプション）を実装する。** Apple Developer Program の登録が完了し、Guideline 3.1.1 が求める正規の売り方（IAP）が取れるようになったため。**外部購入への言及の禁止（3.1.3(a)）は引き続き有効**で、変わったのは「アプリ内で買えるようになった」ことだけ。Web の Stripe 導線への言及は今も一切置かない | [13章](13-app-review.md) |
| 2026-07-29 | **iOS で販売するのは Pro / Max の 2 つ。** 同一の購読グループ `collecie_plan` に入れ、アップグレード・ダウングレードは Apple 側に処理させる。商品 ID は `com.collecie.app.pro.monthly` / `com.collecie.app.max.monthly` | [13章](13-app-review.md) |
| 2026-07-29 | **契約は組織単位。購入できるのは admin だけ。** Apple の購読は Apple ID に紐づくが、Collecie のプランは `organizations.plan`。購入時に `appAccountToken` へ組織 ID を載せ、サーバ側で `organizations.apple_original_transaction_id` に束ねる | [8章](08-data-model.md) |
| 2026-07-29 | **Stripe と Apple を同じ組織で併存させない。** `organizations.plan_source` で出どころを持ち、Stripe 契約中は IAP を 409 で拒否、Apple 契約中は Stripe の checkout を 409 で拒否する。二重に引き落とすと Apple 側は Web から解約できず返金対応になるため | [8章](08-data-model.md) |
| 2026-07-29 | **集金リマインダの起動を「毎日 07:50 JST」から「毎時 0 分」に変更。** 通知時刻は `profiles.notification_prefs.reminderHour` でユーザーごとに変えられるので、1 日 1 回では守れない。Edge Function 側が JST の現在時刻と `reminderHour` を突き合わせて宛先を絞る | [10章](10-push.md) |
| 2026-07-29 | **`DELETE /api/v1/devices` はトークンを body で受ける**（設計図の `/:token` から変更）。Expo のトークンは `ExponentPushToken[...]` と角括弧を含み、URL パスに載せるとエスケープの解釈が環境ごとに割れるため | [6章](06-api-bff.md) |
| 2026-07-29 | **在庫・故障アラートは Edge Function ではなく Web の Server Action から送る。** イベント駆動なので cron に載らない。`updateStockState` / `updateMachinesState` が更新前後を比較し、`after()` で応答後に送る | [10章](10-push.md) |
| 2026-07-29 | **数字の書体をアプリだけ Space Mono → Inter（tabular-nums）に変更。** Web は Space Mono のまま。等幅ではなくなるので `theme/tokens.ts` の `numeric` を必ずセットで使う | [11章](11-design-system.md) |
| 2026-07-30 | **「開発者からのお知らせ」を追加。`announcements` テーブル（005）を Web とアプリで共用する。** 出し分けの列は持たない。投稿は Supabase の Table Editor から手で行い、管理画面も書き込み API も作らない（作るとアプリのトークンでお知らせを捏造できる経路が生まれる） | [13章](13-app-review.md) |
| 2026-07-30 | **お知らせの文面は、Web に出すものも含めて常に iOS の制約（Guideline 3.1.3(a)）で書く。** テーブルを共用する以上、Web 向けに書いた「Pro プラン値上げのお知らせ」がそのままアプリにも出るため。⚠️ **これは運用ルールでしか守れない。**「Web だけに出す」手段は無い。必要になったら `show_in_app`（既定 false）列の追加を再検討する | [13章](13-app-review.md) |

## 実装状況

### Web + BFF（`coin-laundry-app`）

| 項目 | 状態 |
|---|---|
| `src/utils/supabase/server.js` の Bearer 対応 | ✅ |
| `middleware.js` の `/api/v1` 除外 | ✅ |
| `withAuth()` ラッパー（`src/app/api/v1/_lib/handler.js`） | ✅ |
| `GET /api/v1/bootstrap` | ✅ |
| `GET /api/v1/stores` / `GET /api/v1/stores/:id` | ✅ |
| `GET /api/v1/home` | ✅ |
| `/api/v1/funds` 系 5 本（一覧・登録・更新・削除・グラフ・集計） | ✅ |
| `/api/v1/states` 系 4 本（在庫・設備の取得と更新） | ✅ |
| `createData` の冪等性対応（`client_request_id` / 23505 を成功扱い） | ✅ |
| 有効トークンでの 200 応答確認 | ⬜ テストアカウント待ち |
| **DB マイグレーションの適用** | 🔴 **未適用。`migrations/001_mobile_foundation.sql` を Supabase の SQL Editor で実行すること。未適用だと集金登録が失敗する** |

### Expo アプリ（`coinlaundy_app_iOS`）

| 項目 | 状態 |
|---|---|
| プロジェクト（SDK 57 / expo-router / TS） | ✅ |
| デザイントークン（`src/theme/tokens.ts`） | ✅ |
| `LargeSecureStore`（チャンク分割） | ✅ |
| BFF クライアント（Bearer / 401 再試行 / エラーコード） | ✅ |
| TanStack Query + MMKV 永続化 | ✅ |
| ログイン（メール + パスワード） | ✅ |
| Sign in with Apple | ⚠️ 実装済み・**Supabase の provider 設定待ちで未検証** |
| 起動時分岐（未登録 / 未所属 / 通常） | ✅ |
| タブ + ホーム + 店舗一覧 + 店舗詳細 + 設定 | ✅ |
| **集金入力**（カスタムキーパッド・重量換算・ハプティクス） | ✅ |
| Draft 自動保存（1.5 秒 debounce / MMKV） | ✅ |
| Outbox（FIFO・指数バックオフ・再送トリガ・未送信バッジ） | ✅ |
| 収益タブ（売上履歴の無限スクロール + 店舗別累計） | ✅ |
| 管理タブ（在庫・設備の閲覧と更新） | ✅ |
| グラフ（victory-native） | ⬜ 未着手 |
| 初回セットアップ / 組織参加の画面 | ⬜ Phase 3（現状はプレースホルダ） |
| EAS 設定・TestFlight 配布 | ⬜ **Apple Developer Program 取得待ち** |
| 機内モードでの E2E（Maestro） | ⬜ **実機が必要** |

検証: `tsc --noEmit` エラーなし / `expo export --platform ios` 成功（4MB） / Web は `npm test` 102 件全通・`npm run build` 成功。

---

## ドキュメント構成

```
docs/ios/
├── README.md            ← このファイル（目次・決定事項・実装状況）
├── 01-scope.md          1. ゴールとスコープ
│                          ├── なぜネイティブアプリを出すのか（電波 / 通知 / 片手操作）
│                          └── v1 スコープ・v1 で入れないもの
├── 02-authz-decision.md 2. 最重要論点：認可ロジックをどこに置くか  ★設計全体を決める
│                          ├── 現状の構造（service key で RLS 迂回）
│                          ├── 案A: RLS 全面移行 / 案B: BFF の比較
│                          ├── 結論：案B（BFF）を採用
│                          └── 唯一の改修点（server.js の Bearer 対応）
├── 03-architecture.md   3. 全体アーキテクチャ
│                          ├── 構成図（iOS / 共有ロジック / Vercel / Supabase / APNs）
│                          └── 各層の責務と禁止事項
├── 04-repo-structure.md 4. リポジトリ構成  ★2 リポジトリ体制に変更済み
│                          ├── coin-laundry-app（Web + BFF）
│                          ├── coinlaundy_app_iOS（Expo アプリ）
│                          └── 共有ロジックの扱い（方式は未定）
├── 05-auth-session.md   5. 認証・セッション設計
│                          ├── 方式（端末 → Supabase Auth 直、以後 Bearer）
│                          ├── SecureStore 2048 バイト制限 → チャンク分割アダプタ
│                          ├── サインイン手段（Email / Apple / Google）
│                          └── 起動時フロー
├── 06-api-bff.md        6. API 層設計（BFF）
│                          ├── 6.1 共通仕様（ベース URL / 認証 / 冪等性ヘッダ）
│                          ├── 6.2 共通ラッパー withAuth()
│                          ├── 6.3 エンドポイント一覧（起動・店舗・集金・在庫・組織・アカウント）
│                          ├── 6.4 冪等性の設計  ★二重計上の防止
│                          ├── 6.5 レート制限とバージョン管理
│                          ├── 6.6 エラーコード
│                          └── 6.7 エクスポート（v1.1）
├── 07-screens.md        7. 画面設計
│                          ├── 7.1 ナビゲーション（5 タブ / 未所属は 2 タブ）
│                          ├── 7.2 ルート構成（expo-router）
│                          ├── 7.3 画面別マッピングと変更点
│                          └── 7.4 集金入力画面  ★最も作り込む画面
├── 08-data-model.md     8. データモデルと追加スキーマ
│                          ├── 8.1 既存テーブル（変更なし・JSONB の形）
│                          ├── 8.2 追加スキーマ 3 点（冪等性キー / device_tokens / 通知設定）
│                          ├── 8.3 推奨インデックス
│                          └── 8.4 日付の扱い  ★JST 固定・絶対に崩さない
├── 09-offline.md        9. オフライン設計
│                          ├── 9.1 3 層構造（キャッシュ / Draft / Outbox）
│                          ├── 9.2 Outbox の仕様（FIFO・バックオフ・上限 50 件）
│                          └── 9.3 オフライン時の UI ルール
├── 10-push.md          10. プッシュ通知設計
│                          ├── 10.1 構成（pg_cron → Edge Function → Expo Push → APNs）
│                          ├── 10.2 通知の種類 5 種
│                          └── 10.3 実装メモ（許可プライミングのタイミング）
├── 11-design-system.md 11. デザインシステムの移植
│                          ├── tokens.ts（色 / radius / shadow / font / gradient）
│                          ├── Web との対応表
│                          └── RN 固有の注意（ライト固定・フォント容量）
├── 12-libraries.md     12. ライブラリ選定（採用理由と却下したもの）
├── 13-app-review.md    13. App Store 審査対応  ★落とすとリジェクト
│                          ├── 13.1 課金：プランは read-only 表示のみ
│                          ├── 13.2 Sign in with Apple（必須）
│                          ├── 13.3 アカウント削除（必須・新規実装）
│                          └── 13.4 その他（Privacy Manifest / 審査用アカウント ほか）
├── 14-phases.md        14. 実装フェーズ
│                          ├── Phase 0 基盤整備（Web 側・アプリはまだ書かない）
│                          ├── Phase 1 読み取り専用アプリ
│                          ├── Phase 2 集金入力  ★本体
│                          ├── Phase 3 設定・通知・審査準備
│                          └── Phase 4 提出・v1.1
├── 15-risks.md         15. リスクと決定事項
│                          ├── リスク R1〜R7
│                          └── 決定事項 6 件（2026-07-27 確定）
└── 99-mapping.md       付録: 既存コードとの対応早見表
```

---

## 章の索引

| # | 章 | 要点 |
|---|---|---|
| 1 | [ゴールとスコープ](01-scope.md) | PWA が構造的に解けない 3 つの課題（電波・通知・片手操作）を解く |
| 2 | [認可ロジックをどこに置くか](02-authz-decision.md) | **★ 案B（BFF）を採用**。改修は `server.js` 1 ファイルのみ |
| 3 | [全体アーキテクチャ](03-architecture.md) | 各層の責務。アプリは `SUPABASE_SERVICE_KEY` を絶対に持たない |
| 4 | [リポジトリ構成](04-repo-structure.md) | **★ 2 リポジトリ体制**。モノレポ化はしない |
| 5 | [認証・セッション設計](05-auth-session.md) | 認証だけ端末 → Supabase 直。SecureStore の 2048 バイト制限に注意 |
| 6 | [API 層設計（BFF）](06-api-bff.md) | `/api/v1/*` の全エンドポイント。Route Handler は薄く保つ |
| 7 | [画面設計](07-screens.md) | Web と同じ 5 タブ構成。集金入力画面に全振り |
| 8 | [データモデルと追加スキーマ](08-data-model.md) | 既存テーブルは無変更。追加は 3 点のみ |
| 9 | [オフライン設計](09-offline.md) | キャッシュ / Draft / Outbox の 3 層。SQLite 同期はやらない |
| 10 | [プッシュ通知設計](10-push.md) | pg_cron + Edge Function + Expo Push。`getNextCollectDate()` を再利用 |
| 11 | [デザインシステムの移植](11-design-system.md) | `globals.css` の CSS 変数を `tokens.ts` に 1:1 移植 |
| 12 | [ライブラリ選定](12-libraries.md) | Expo SDK 54+ / expo-router / TanStack Query / MMKV ほか |
| 13 | [App Store 審査対応](13-app-review.md) | **★ 課金導線ゼロ・Apple サインイン・アカウント削除は必須** |
| 14 | [実装フェーズ](14-phases.md) | Phase 0〜4。各フェーズ末で `npm test` と `npm run build` |
| 15 | [リスクと決定事項](15-risks.md) | R1〜R7 と、確定済みの 6 件 |
| 付 | [既存コードとの対応早見表](99-mapping.md) | 現行 Web のファイル → iOS 版での置き場所 |

---

## 先に押さえるべき決定事項

実装に入る前に、最低限この 5 つは頭に入れておくこと。詳細は各章へ。

| 決定 | 内容 | 出典 |
|---|---|---|
| **認可は BFF に置く** | RLS 全面移行はしない。既存 Server Action を Route Handler から直接 import して呼ぶ。改修は `src/utils/supabase/server.js` の Bearer 対応のみ | [2章](02-authz-decision.md) |
| **冪等性キーは必須** | 現行は `date` にランダムジッターを足すため同一入力が 2 件入る。`client_request_id` + 部分ユニークインデックスで DB レベルに保証しないと、オフライン再送で**集金額が二重計上される** | [6.4](06-api-bff.md#64-冪等性の設計) |
| **日付は JST 固定** | `collect_funds.date` は JST 深夜 0 時の epoch（**ミリ秒**。`getEpochTimeInSeconds` は名前に反してミリ秒を返す）。DatePicker の `Date` をそのまま送ると 1 日ずれる | [8.4](08-data-model.md#84-日付の扱い絶対に崩さないこと) |
| **課金導線はゼロ** | プランは read-only 表示のみ。アップグレードボタン・価格表・外部リンクに加え、**「Web で契約できます」等の言及もリジェクト事由** | [13.1](13-app-review.md#131-課金guideline-311--313-決定事項) |
| **Web を壊さない** | Bearer 対応・`/api/v1` 追加はすべて加算的な変更に留める。フェーズ末に `npm test` と `npm run build` | [14章](14-phases.md) / [R1](15-risks.md) |

---

## 未解決の論点

決定事項ログにない、実装時に判断が必要な残件。

| # | 論点 | 判断が必要な時期 |
|---|---|---|
| 1 | **Apple Developer Program / EAS アカウント** — TestFlight 配布と開発ビルドに必須。**現在ここで止まっている** | 🔴 いま |
| 2 | **Supabase の Apple provider 有効化** — Services ID / Key ID / Team ID / .p8 の登録。Sign in with Apple はコードだけ実装済みで未検証 | 🔴 いま |
| 3 | **`createData` への `client_request_id` の通し方** — 既存 Server Action への加算的な引数追加が必要 | Phase 2 着手時 |
| 4 | **低在庫・故障アラートのトリガ** — 10.2 はイベント駆動だが 10.1 の構成は日次 pg_cron のみ。DB トリガか Server Action フックの設計が未記載 | Phase 3 着手時 |
| 5 | **Edge Function（Deno）からの共有ロジック参照** — コピー運用の対象を Deno 側にも広げるか、別方式にするか | Phase 3 着手時 |

> 共有ロジックの配布方法（旧 1 番）は 2026-07-27 に**コピー運用**で確定した。決定事項ログ参照。
