# 6. API 層設計（BFF）

> [← 目次に戻る](README.md)

**この章の構成**

- [6.1 共通仕様](#61-共通仕様)
- [6.2 共通ラッパー](#62-共通ラッパー)
- [6.3 エンドポイント一覧](#63-エンドポイント一覧)
- [6.4 冪等性の設計](#64-冪等性の設計)
- [6.5 レート制限とバージョン管理](#65-レート制限とバージョン管理)
- [6.6 エラーコード](#66-エラーコード)
- [6.7 エクスポート](#67-エクスポート)

## 6.1 共通仕様

| 項目 | 仕様 |
|---|---|
| ベース URL | `https://www.collecie.com/api/v1` |
| 認証 | `Authorization: Bearer <supabase access_token>`（全エンドポイント必須）|
| Content-Type | `application/json`（画像アップロードのみ `multipart/form-data`）|
| 成功レスポンス | `{ "data": ... }` |
| エラーレスポンス | `{ "error": { "message": "日本語メッセージ", "code": "FORBIDDEN" } }` |
| クライアントバージョン | `X-Client-Version: ios/1.0.0` → 将来の強制アップデート判定に使う |
| 冪等性 | 書き込み系は `Idempotency-Key: <uuid v4>` を必須化 |

## 6.2 共通ラッパー

Route Handler は薄く保つ。認可は既存 Server Action が持っているので、ここでは JWT 検証と整形だけ行う。

```js
// apps/web/src/app/api/v1/_lib/handler.js
import { NextResponse } from "next/server";
import { getUser } from "@/app/api/supabaseFunctions/supabaseDatabase/user/action";

export function withAuth(fn) {
  return async (req, ctx) => {
    const { user } = await getUser();          // ← Bearer を server.js が解決済み
    if (!user) return NextResponse.json(
      { error: { message: "ログインしてください", code: "UNAUTHENTICATED" } },
      { status: 401 }
    );
    try {
      const { data, error, status } = await fn(req, ctx, user);
      if (error) return NextResponse.json(
        { error: { message: typeof error === "string" ? error : error.msg } },
        { status: status ?? (typeof error === "object" && error.status) ?? 400 }
      );
      return NextResponse.json({ data });
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: { message: "予期しないエラーが発生しました" } }, { status: 500 }
      );
    }
  };
}
```

## 6.3 エンドポイント一覧

凡例: 🔒 = admin 限定 / ✍️ = viewer 不可（admin・collecter のみ）

### 起動・ホーム

| Method | Path | 委譲先 Server Action | 備考 |
|---|---|---|---|
| GET | `/bootstrap` | `getUser` + `getProfile` + `getMyOrganization` + `getOrgPlan` + `getCollectSchedule` | 起動時 1 リクエストに集約。`Promise.all` で並列化 |
| GET | `/home` | `getMonthFunds` + `getRecentCollectFunds` + `getStockStates` + `getMachinesStates` | 同上。低在庫・故障の件数だけ返し、詳細は各タブで取得 |

### 店舗

| Method | Path | 委譲先 | |
|---|---|---|---|
| GET | `/stores` | `getStores()` | |
| GET | `/stores/:id` | `getStore(id)` | |
| POST | `/stores` | `createStore(formData)` | 🔒 プラン上限チェックは Server Action 内で実施済み |
| PATCH | `/stores/:id` | `updateStore(formData, id)` | 🔒 機種の増減 → `laundry_state.machines` 同期も既存ロジックが担う |
| DELETE | `/stores/:id` | `deleteStore(id)` | 🔒 |
| POST | `/stores/images` | `uploadStoreImage(formData)` | 🔒 `multipart/form-data` |
| DELETE | `/stores/images` | `deleteStoreImage(path)` | 🔒 |

### 集金データ（アプリの中核）

| Method | Path | 委譲先 | |
|---|---|---|---|
| GET | `/funds?storeId&offset&limit&order&asc` | `getStoreFundsPaginated` / `getOrgCollectFundsPaginated` | `storeId` 有無で分岐 |
| GET | `/funds?storeId&from&to&order&asc` | `getStoreFundsInPeriod` / `getOrgCollectFundsInPeriod` | 期間指定時 |
| GET | `/funds/:id` | `getFundItemById(id)` | 明細（`fundsArray`）の遅延取得 |
| POST | `/funds` | `createData(formData)` | ✍️ **`Idempotency-Key` 必須**（[6.4](#64-冪等性の設計)）|
| PATCH | `/funds/:id` | `updateData` / `updateDate` | ✍️ body に `fundsArray`/`totalFunds` or `date` |
| DELETE | `/funds/:id` | `deleteData(id)` | ✍️ |
| GET | `/funds/chart?storeId&from&to` | `getStoreFundsForChart` / `getOrgCollectFunds` | グラフ用（軽量カラムのみ）|
| GET | `/funds/summary/monthly?storeId` | `getCollectMonthlySummary` | 前月比・前年同月比 |
| GET | `/funds/summary/stores` | `getStoreRevenueSummary` | 店舗別累計 |

### 在庫・設備

| Method | Path | 委譲先 | |
|---|---|---|---|
| GET | `/states` | `getAllLaundryStates()` | |
| GET | `/states/:laundryId` | `getLaundryState(laundryId)` | |
| PATCH | `/states/:laundryId/machines` | `updateMachinesState` | ✍️ |
| PATCH | `/states/:laundryId/stock` | `updateStockState` | ✍️ `extra_stocks` / `stock_thresholds` 含む |

### 組織・メンバー

| Method | Path | 委譲先 | |
|---|---|---|---|
| POST | `/org` | `createOrganization(name)` | |
| PATCH | `/org` | `updateOrganizationName(name)` | 🔒 |
| POST | `/org/join` | `requestJoinOrg(adminEmail, password)` | 組織参加 |
| GET | `/org/members` | `getOrganizationMembers()` | |
| PATCH | `/org/members/:userId` | `updateMemberRole(userId, role)` | 🔒 |
| DELETE | `/org/members/:userId` | `removeMember(userId)` | 🔒 |
| GET/POST/DELETE | `/org/invitations[/:id]` | `getOrganizationInvitations` / `inviteMember` / `deleteInvitation` | 🔒 |
| GET/PUT | `/org/collect-schedule` | `getCollectSchedule` / `updateCollectSchedule` | PUT は 🔒 |
| GET/PUT | `/org/join-password` | `getOrgJoinPassword` / `setOrgJoinPassword` | 🔒 |
| GET | `/org/messages` | `getOrgMessages(orgId)` | 操作ログ |

### アカウント・プラン

| Method | Path | 委譲先 | |
|---|---|---|---|
| GET/PATCH | `/profile` | `getProfile` / `updateProfile` / `setCollectMethod` | |
| POST | `/profile/avatar` | `uploadAndSetAvatar(formData)` | |
| GET | `/plan` | `getOrgPlan()` | **read-only**。checkout / portal は生やさない |
| POST | `/devices` | ★新規 | プッシュトークン登録 |
| DELETE | `/devices/:token` | ★新規 | ログアウト時に解除 |
| DELETE | `/account` | ★新規 | **App Store 5.1.1(v) 対応**（[13章 App Store 審査対応](13-app-review.md)）|

## 6.4 冪等性の設計

**これは必須。** 現行の集金登録はこうなっている：

```js
// src/app/feacher/dialog/CheckDialogCollectMoney.jsx:66
date: epoc + Math.floor(Math.random() * 1000),
```

`date` にランダムなジッターを足しているため、**同じ入力を 2 回送ると別レコードとして 2 件入る**。オフライン送信キューは「送信したがレスポンスを受け取れなかった」ケースで必ず再送するので、このままでは**集金額の二重計上**が起きる。

対策：

```sql
ALTER TABLE public.collect_funds ADD COLUMN IF NOT EXISTS client_request_id text;
CREATE UNIQUE INDEX IF NOT EXISTS collect_funds_client_request_id_uniq
  ON public.collect_funds (client_request_id)
  WHERE client_request_id IS NOT NULL;
```

- 端末は集金フォームを開いた時点で `uuid v4` を 1 個生成し、下書き・Outbox とともに保持する
- `POST /funds` は `Idempotency-Key` ヘッダをそのまま `client_request_id` に入れて INSERT
- 一意制約違反（`23505`）は **成功扱い**にして既存レコードを返す
- Web 側は `client_request_id = NULL` のままなので影響なし（部分ユニークインデックス）

> 併せて `date` のランダムジッターは廃止候補。ジッターがあると同日 2 回集金の並び順が不定になり、`packages/core` の月次集計とも噛み合わない。ただし既存データとの互換があるため **v1 では触らず、iOS からの新規レコードのみジッターなしで送る**（`applyDateRange` は `gte`/`lt` なので日境界の判定には影響しない）。

## 6.5 レート制限とバージョン管理

- `POST /funds` は端末あたり 60 req/min で十分。Vercel の WAF ルールで足りる
- `X-Client-Version` を見て、サポート切れバージョンには `426 Upgrade Required` + `{ error: { code: "UPGRADE_REQUIRED" } }` を返し、アプリは強制アップデート画面を出す

## 6.6 エラーコード

| code | HTTP | アプリ側の挙動 |
|---|---|---|
| `UNAUTHENTICATED` | 401 | セッション更新を 1 回試行 → 失敗ならログイン画面 |
| `FORBIDDEN` | 403 | トーストで理由表示。画面は維持 |
| `NO_ORG` | 403 | 組織参加画面へ |
| `PLAN_LIMIT` | 403 | 「店舗を追加できません」のみ表示（**アップグレード導線は出さない**）|
| `UPGRADE_REQUIRED` | 426 | 強制アップデート画面 |
| `CONFLICT` | 409 | Outbox は成功扱いで破棄 |

## 6.7 エクスポート

v1.1 で実装。**CSV も Excel もサーバ生成に統一**する（RN では `write-excel-file` を動かせず、CSV もクライアント生成する利点がないため）。

```
POST /api/v1/export/xlsx   → 既存 /api/export/collect-xlsx を Bearer 対応させて流用
POST /api/v1/export/csv    → 新規（packages/core の csvExport をサーバ側で使う）
```

アプリ側は `expo-file-system` の `downloadAsync` で保存 → `expo-sharing` で共有シートを開く。
Pro プラン未満は現行どおり 403 を返し、アプリは「Pro プラン以上の機能です」とだけ表示する（**課金導線は置かない**）。

---

**関連章**: [2. 認可ロジックの配置](02-authz-decision.md) / [8. データモデルと追加スキーマ](08-data-model.md) / [9. オフライン設計](09-offline.md) / [13. App Store 審査対応](13-app-review.md)
