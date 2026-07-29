# 13. App Store 審査対応

> [← 目次に戻る](README.md)

**この章の項目を落とすとリジェクトされる。** 実装前にチェックリスト化しておく。

**この章の構成**

- [13.1 課金（Guideline 3.1.1 / 3.1.3）— 決定事項](#131-課金guideline-311--313-決定事項)
- [13.2 Sign in with Apple（Guideline 4.8）— 必須](#132-sign-in-with-appleguideline-48-必須)
- [13.3 アカウント削除（Guideline 5.1.1(v)）— 必須・新規実装](#133-アカウント削除guideline-511v-必須新規実装)
- [13.4 その他の必須項目](#134-その他の必須項目)

## 13.1 課金（Guideline 3.1.1 / 3.1.3）— 決定事項

> **2026-07-29 改訂。** 以前は「アプリ内でプランは read-only 表示のみ」としていたが、
> Apple Developer Program の登録完了により **アプリ内課金（StoreKit の自動更新
> サブスクリプション）を実装する**方針に変更した。
>
> 変わったのは「アプリ内で買えるようになった」ことだけで、**外部購入への言及の
> 禁止は今も有効**。3.1.3(a) は「アプリ内課金があるかどうか」と無関係に効く。

### 売り方

- 販売するのは **Pro / Max の 2 つ**。購読グループは `collecie_plan` の 1 つにまとめ、
  アップグレード・ダウングレードは Apple 側に処理させる
- 商品 ID は `com.collecie.app.pro.monthly` / `com.collecie.app.max.monthly`
  （**App Store Connect で一度作ると変更も再利用もできない**）
- 契約は**組織単位**。購入できるのは `admin` のみ
- Free の上限到達時の表示は「**店舗を追加できません（上限 3 店舗）**」＋プラン画面への導線まで

### 出してよいもの / 絶対に置かないもの

- ✅ プラン名、店舗数、**StoreKit が返した `displayPrice`**、更新日、購読の内容の開示、
  「購入を復元」、「サブスクリプションを管理」（Apple の購読管理へのディープリンク）
- ❌ **絶対に置かない**：`collecie.com` への購入リンク、「Web サイトで契約できます」等の
  **言及**、Stripe を想起させる表記、価格のハードコード
- ⚠️ **価格を文字列で持たない。** 必ず `displayPrice` を使う。ハードコードすると地域・
  為替・Apple の価格改定で実際の請求額とずれ、Guideline 3.1.2 に触れる
- `/api/v1/stripe/*` は引き続き**生やさない**。アプリ側の課金経路は
  `POST /api/v1/billing/apple/verify` の 1 本だけ

### Guideline 3.1.2 が求める開示（プラン画面に必須）

購読の名称・期間・価格に加えて、**利用規約とプライバシーポリシーへの機能するリンク**、
そして**購入を復元する手段**が同一画面に無いとリジェクトされる。
実装は `app/settings/plan.tsx` と `src/components/settings/PlanCards.tsx`。

### サーバ側の検証（必須）

**StoreKit の戻り値だけでプランを上げてはいけない。** 端末の中の話なので改造した
端末からは自由に作れる。アプリは `purchaseToken`（iOS では JWS）を BFF に送り、
`@apple/app-store-server-library` の `SignedDataVerifier` で Apple のルート CA まで
署名を辿ってから `organizations.plan` を書き換える。

- 検証: `src/utils/apple/verify.js`
- 反映: `src/app/api/supabaseFunctions/supabaseDatabase/billing/appleAction.js`
- 更新・解約・返金の追随: `POST /api/apple/notifications`（App Store Server Notifications V2）

⚠️ **サーバの検証が通ってから `finishTransaction()` を呼ぶこと。** 先に閉じると
StoreKit がその取引を二度と返さなくなり、検証に失敗した購入が宙に浮く。

### Stripe との併存

同じ組織に Stripe と Apple の契約を同時に生かさない。`organizations.plan_source` で
出どころを持ち、双方向に 409 で弾く。二重に引き落とすと **Apple 側は Web からも
アプリからも解約できない**ため、返金対応しか手が無くなる。

## 13.2 Sign in with Apple（Guideline 4.8）— 必須

現行 Web は Google / GitHub の OAuth を提供している（`ProviderForm.jsx`）。**第三者ログインを提供するアプリは、同等のプライバシー保護オプションを併せて提供する義務がある。** iOS 版で Google サインインを出すなら Sign in with Apple の実装は必須。

- Supabase ダッシュボードで Apple provider を有効化（Services ID / Key ID / Team ID / .p8 の登録）
- `expo-apple-authentication` → `supabase.auth.signInWithIdToken({ provider: "apple", token: identityToken })`
- **メール非公開（private relay）を選ばれた場合**、`profiles.username` が空になるので初回セットアップ画面で必ず表示名を入力させる
- ボタンは Apple の HIG に従う（`AppleAuthenticationButton` をそのまま使う）

## 13.3 アカウント削除（Guideline 5.1.1(v)）— 必須・**新規実装**

アカウント作成機能があるアプリは、**アプリ内からアカウント削除を開始できなければならない**。現行にあるのは組織削除（`deleteMyOrganization`）だけで、**auth ユーザーの削除がない**。

新規に `DELETE /api/v1/account` を実装する。削除順は既存の `deleteMyOrganization` の FK 順序を踏襲する：

```
① 自分が admin かつ owner の組織がある場合
   laundry_state → collect_funds → laundry_store
   → action_message → organization_invitations
   → organization_members → organizations
② そうでない場合
   自分の organization_members 行を削除（組織からの離脱）
   ※ collect_funds.collecter は他メンバーの参照があるため、
     レコード自体は残し collecter を NULL 化するか要検討
③ profiles を削除
④ supabase.auth.admin.deleteUser(user.id)
⑤ Storage の avatars/{user.id}.* を削除
```

⚠️ **要検討**：`collect_funds.collecter` は `profiles(id)` への FK。過去の集金記録を消すと組織の売上履歴に穴が開く。**記録は残し、`collecter` を NULL 許容にして退会ユーザーは「退会済みユーザー」と表示**するのが妥当。この判断は削除実装前に確定させること。

削除フローの UI 要件：設定 → アカウント → 「アカウントを削除」→ 影響の説明（削除される店舗数・集金件数）→ パスワード再入力 → 確認ダイアログ。

## 13.4 その他の必須項目

| 項目 | 対応 |
|---|---|
| **Privacy Manifest**（`PrivacyInfo.xcprivacy`）| Expo は `app.json` の `ios.privacyManifests` から生成。収集データ：メールアドレス（アプリ機能）、ユーザー ID（アプリ機能）。**トラッキング目的の収集なし** |
| **App Tracking Transparency** | 不要（サードパーティトラッキングを一切行わないため）|
| **審査用アカウント** | デモ組織 + 3 店舗 + 数か月分のサンプル集金データを用意し、App Store Connect の「サインイン情報」に記載。**空アカウントを渡すと機能が見えずリジェクトされる** |
| **最低 OS バージョン** | iOS 16.0+（Expo SDK 54 の要件。RN の Skia / Reanimated も安定）|
| **スクリーンショット** | 6.9" / 6.5" / iPad（iPad 対応するなら）。`public/screenshots/` の PWA 用資産を流用可 |
| **サポート URL / プライバシー URL** | 既存の `/help` `/privacy` `/terms` `/tokushoho` をそのまま指定 |
| **年齢制限** | 4+（ユーザー生成コンテンツは組織内のメモのみ）|
| **iPad 対応** | v1 では iPhone 専用（`"supportsTablet": false`）。現場は iPhone 前提 |
| **ディープリンク** | Universal Links（`applinks:www.collecie.com`）。パスワードリセットと通知タップの遷移に使う |

---

**関連章**: [1. ゴールとスコープ](01-scope.md) / [5. 認証・セッション設計](05-auth-session.md) / [14. 実装フェーズ](14-phases.md) / [15. リスクと未決事項](15-risks.md)
