# 12. ライブラリ選定

> [← 目次に戻る](README.md)

| 用途 | 採用 | 理由 / 却下したもの |
|---|---|---|
| フレームワーク | **Expo SDK 54+**（Managed / CNG）| EAS Build で証明書管理まで面倒を見てくれる |
| ルーティング | **expo-router v4** | ファイルベースで Next.js App Router と発想が近く、Web からの移植で迷わない |
| 言語 | **TypeScript** | ⚠️ Web は「`.jsx` 統一・TS 移行予定なし」だが、**アプリは TS を推奨**。API レスポンス型と JSONB の形をコンパイル時に守れる価値が大きい。`packages/core` は JS のまま `.d.ts` を添える |
| サーバ状態 | **TanStack Query v5** + `@tanstack/query-async-storage-persister` | オフラインキャッシュ・無限スクロール・再検証が 1 つで揃う |
| ローカル永続化 | **react-native-mmkv** | 同期 API。Outbox / Draft の書き込みが UI をブロックしない。AsyncStorage は非同期で下書き自動保存に向かない |
| セキュア保存 | **expo-secure-store**（チャンク分割アダプタ経由）| [5章 認証・セッション設計](05-auth-session.md) の 2048 バイト制限に注意 |
| 認証 | **@supabase/supabase-js v2** | 認証のみに使用。DB クエリには使わない |
| Apple サインイン | **expo-apple-authentication** | 審査必須 |
| チャート | **victory-native (XL) + @shopify/react-native-skia** | Skia 描画で 60fps。`react-native-svg` ベースの旧 Victory / gifted-charts は棒が多いと重い |
| リスト | **@shopify/flash-list** | 売上履歴が数千件になり得るため |
| 画像 | **expo-image** + **expo-image-picker** + **expo-image-manipulator** | アップロード前にリサイズ（Storage 容量とアップロード時間の節約）|
| アニメーション | **react-native-reanimated v3** | `fadeSlideUp` 相当・タブのピルインジケーター |
| 通知 | **expo-notifications** | |
| ネットワーク検知 | **@react-native-community/netinfo** | Outbox の flush トリガ |
| ファイル / 共有 | **expo-file-system** + **expo-sharing** | エクスポート（v1.1）|
| 触覚 | **expo-haptics** | 集金入力の打鍵フィードバック |
| 生体認証 | **expo-local-authentication** | Face ID によるアプリロック（設定でオプトイン）|
| エラー監視 | **Sentry**（`@sentry/react-native`）| 現場端末の不具合は再現できないため必須 |
| テスト | **Vitest**（`packages/core`）+ **Jest + RNTL**（アプリ）+ **Maestro**（E2E）| `packages/core` の既存テストは無改修で通る |

---

**関連章**: [4. リポジトリ構成](04-repo-structure.md) / [11. デザインシステムの移植](11-design-system.md) / [9. オフライン設計](09-offline.md)
