# 8. データモデルと追加スキーマ

> [← 目次に戻る](README.md)

**この章の構成**

- [8.1 既存テーブル（変更なし）](#81-既存テーブル変更なし)
- [8.2 追加スキーマ（3 点のみ）](#82-追加スキーマ3-点のみ)
- [8.3 パフォーマンス上の推奨インデックス](#83-パフォーマンス上の推奨インデックス)
- [8.4 日付の扱い（絶対に崩さないこと）](#84-日付の扱い絶対に崩さないこと)

## 8.1 既存テーブル（変更なし）

`organizations` / `organization_members` / `organization_invitations` / `laundry_store` / `laundry_state` / `collect_funds` / `action_message` / `profiles` は**そのまま使う**。JSONB カラムの形は現行実装に完全に従う。

```ts
// packages/core/types.d.ts（JSDoc でも可。プロジェクトは JS のため型は参考情報）

/** laundry_store.machines */
type Machine = { id: string; name: string; /* 台数などの追加フィールド */ };

/** laundry_state.machines — 店舗作成時に「両替機・店内状況・備品」が先頭に自動追加される */
type MachineState = { id: string; name: string; break: boolean; comment: string };

/** laundry_state.extra_stocks */
type ExtraStock = { id: string; name: string; count: number; threshold: number };

/** laundry_state.stock_thresholds */
type StockThresholds = { detergent: number; softener: number };

/** collect_funds.fundsArray — 「合計入力」モードでは空配列 */
type FundEntry = { id: string; name: string; funds: number };  // funds = 硬貨枚数

/** organizations.collect_schedule */
type CollectSchedule =
  | { type: "weekly";  days: number[] }   // 0=日 … 6=土
  | { type: "monthly"; days: number[] };  // 1 … 31
```

## 8.2 追加スキーマ（3 点のみ）

```sql
-- ① 冪等性キー（オフライン再送による二重計上の防止）
ALTER TABLE public.collect_funds
  ADD COLUMN IF NOT EXISTS client_request_id text;
CREATE UNIQUE INDEX IF NOT EXISTS collect_funds_client_request_id_uniq
  ON public.collect_funds (client_request_id)
  WHERE client_request_id IS NOT NULL;

-- ② プッシュ通知トークン
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expo_token   text NOT NULL UNIQUE,
  platform     text NOT NULL DEFAULT 'ios',
  app_version  text,
  enabled      boolean NOT NULL DEFAULT true
);
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY device_tokens_own ON public.device_tokens
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ③ 通知設定（ユーザー単位）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb
  DEFAULT '{"collectReminder":true,"lowStock":true,"machineBreak":true,"reminderHour":8}'::jsonb;
```

## 8.3 パフォーマンス上の推奨インデックス

集金データはレコードが単調増加する。モバイルは無限スクロールで頻繁に叩くため、以下を追加しておく（Web にも効く）。

```sql
CREATE INDEX IF NOT EXISTS collect_funds_laundry_date_idx
  ON public.collect_funds ("laundryId", date DESC);
```

`getStoreFundsPaginated` / `getOrgCollectFundsInPeriod` などが `laundryId` 絞り + `date` ソートで走るため、この複合インデックスが効く。

## 8.4 日付の扱い（絶対に崩さないこと）

`CLAUDE.md` の「日付・期間フィルタ（重要）」節はモバイルでも**完全に同じ規約**を適用する。

- `collect_funds.date` は `getEpochTimeInSeconds()` が返す **JST 深夜 0 時ちょうど**の epoch（ミリ秒）
- 端末のタイムゾーンが JST 以外でも必ず JST 基準で計算する。`new Date()` をそのまま使わず `packages/core/makeDate/date.js` の関数を通す
- 期間フィルタはサーバ側の `applyDateRange()` に一元化されているので、**アプリは `from` / `to` の epoch を渡すだけ**。`gt` / `gte` の判断をアプリ側でしない

> iOS の DatePicker は端末 TZ のローカル `Date` を返す。これを `getEpochTimeInSeconds(y, m, d)` に**年月日だけ渡して**再構築すること。`date.getTime()` をそのまま送ると 1 日ずれる。

---

**関連章**: [6.4 冪等性の設計](06-api-bff.md#64-冪等性の設計) / [10. プッシュ通知設計](10-push.md) / [15. リスクと未決事項](15-risks.md)
