# 付録：既存コードとの対応早見表

> [← 目次に戻る](README.md)

> **`packages/core` は論理的な呼び名。** モノレポ化を見送ったため物理的な正本は
> `coin-laundry-app/src/functions/` のまま。Expo 側への配布方法は [4章](04-repo-structure.md) 参照。
> 「iOS 版での置き場所」の `apps/mobile/src/...` は `coinlaundy_app_iOS/src/...` と読み替えること。

| 現行 Web | iOS 版での置き場所 |
|---|---|
| `src/functions/*.js` | 移設しない。Expo 側へは配布方式を決めて取り込む（[4章](04-repo-structure.md)）|
| `src/app/api/supabaseFunctions/**/action.js` | **そのまま。Route Handler から呼ぶ** |
| `src/utils/supabase/server.js` | Bearer 対応を追加（唯一の改修点）|
| `src/utils/supabase/service.js` | サーバ専用。**アプリには絶対に持ち込まない** |
| `src/utils/orgGuard.js` | `/api/v1/bootstrap` のレスポンスで代替 |
| `src/app/feacher/**` | `apps/mobile/src/features/**` に対応する画面を新規実装 |
| `src/app/feacher/collectMoney/hooks/useDraft.js` | `apps/mobile/src/offline/draft.ts`（localStorage → MMKV）|
| `src/app/globals.css` の CSS 変数 | `apps/mobile/src/theme/tokens.ts` |
| `public/manifest.json` | `apps/mobile/app.json`（`theme_color` `#0891B2` などを引き継ぐ）|
| `CheckDialogCollectMoney.jsx` の `coinWeight = 4.8` | `packages/core/src/collectMoney.js` に切り出して共有 |

---

**関連章**: [4. リポジトリ構成](04-repo-structure.md) / [11. デザインシステムの移植](11-design-system.md) / [2. 認可ロジックの配置](02-authz-decision.md)
