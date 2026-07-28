# 13. App Store 審査対応

> [← 目次に戻る](README.md)

**この章の項目を落とすとリジェクトされる。** 実装前にチェックリスト化しておく。

**この章の構成**

- [13.1 課金（Guideline 3.1.1 / 3.1.3）— 決定事項](#131-課金guideline-311--313-決定事項)
- [13.2 Sign in with Apple（Guideline 4.8）— 必須](#132-sign-in-with-appleguideline-48-必須)
- [13.3 アカウント削除（Guideline 5.1.1(v)）— 必須・新規実装](#133-アカウント削除guideline-511v-必須新規実装)
- [13.4 その他の必須項目](#134-その他の必須項目)

## 13.1 課金（Guideline 3.1.1 / 3.1.3）— 決定事項

アプリ内で **プランは read-only 表示のみ**とする。

- ✅ 表示してよい：現在のプラン名（`Free` / `Pro` / `Max`）、店舗数 `3 / 5`、トライアル残日数
- ❌ **絶対に置かない**：アップグレードボタン、価格表、`collecie.com` への外部リンク、「Web サイトで契約できます」等の文言、決済を想起させるアイコン
- 上限到達時の表示は「**店舗を追加できません（上限 3 店舗）**」まで。それ以上の誘導はしない
- `GET /api/v1/plan` は返すが、`/api/v1/stripe/*` は**生やさない**

> Apple は「外部購入への誘導」自体を 3.1.3(a) で禁止している。リンクだけでなく**言及**もリジェクト事由になるため、文言レビューを審査前に必ず行う。

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
