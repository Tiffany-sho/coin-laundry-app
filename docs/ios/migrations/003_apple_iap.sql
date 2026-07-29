-- =====================================================================
-- Collecie iOS アプリ内課金（StoreKit / 自動更新サブスクリプション）用
--   Supabase ダッシュボード > SQL Editor で実行する。
--
-- 002 とは独立。002 を先に当てていなくても実行できる。
--
-- すべて列の追加のみ。既存データは変更しない。
-- 既に Stripe で課金中の組織は plan_source が NULL のままだが、
-- ④ のバックフィルで 'stripe' に寄せる。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 契約の出どころ
--
-- Apple のサブスクは Apple ID に紐づき、解約も Apple 側でしか行えない。
-- 一方 Stripe の契約は Web 側で管理する。**同じ組織に両方が生きている状態を
-- 作らないこと**が二重課金を防ぐ唯一の防波堤なので、どちらで買ったかを持つ。
--
-- NULL = 有料契約なし（free）。
-- ---------------------------------------------------------------------
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_source text;

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_plan_source_check;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_plan_source_check
  CHECK (plan_source IS NULL OR plan_source IN ('stripe', 'apple'));

-- ---------------------------------------------------------------------
-- ② Apple 側の契約識別子
--
-- original_transaction_id は「その購読の一生」を通じて不変で、更新のたびに
-- 発行される transaction_id とは別物。組織との対応付けはこちらで持つ。
--
-- ⚠️ UNIQUE にしてあるのは、1 つの Apple サブスクを複数の組織に付け替えて
--    使い回されるのを防ぐため。付け替えたい場合は先に NULL に落とす。
-- ---------------------------------------------------------------------
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS apple_original_transaction_id text;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS apple_product_id text;

-- 失効時刻。ここを過ぎたら free に落とす。猶予期間（Billing Grace Period）中は
-- Apple が期限を伸ばして通知してくるので、この列を更新するだけでよい
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS apple_expires_at timestamptz;

-- 'Sandbox' か 'Production'。Sandbox の購読は数分で更新・失効を繰り返すので、
-- 本番データに混ざったときに切り分けられるよう残す
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS apple_environment text;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_apple_original_tx_idx
  ON public.organizations (apple_original_transaction_id)
  WHERE apple_original_transaction_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- ③ 通知の重複処理よけ
--
-- App Store Server Notifications V2 は **同じ通知を再送する**（受信側が 2xx を
-- 返さなかった場合、最大 5 回・3 時間かけて再試行する）。notification_uuid を
-- 記録しておき、2 回目以降は握って 200 を返す。
--
-- ⚠️ 記録が無いまま再送を受けると、返金→再付与 のように順序が狂ったときに
--    プランが誤った状態で固定される。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.apple_notifications (
  notification_uuid text PRIMARY KEY,
  received_at       timestamptz NOT NULL DEFAULT now(),
  notification_type text,
  subtype           text,
  original_transaction_id text,
  org_id            uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  payload           jsonb
);

-- service role からしか触らない。RLS を有効にしてポリシーを一切作らないことで、
-- anon / authenticated からは実質不可視になる
ALTER TABLE public.apple_notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- ④ 既存データのバックフィル
--
-- 今 Stripe で課金中の組織に出どころを入れておく。これを忘れると、
-- Stripe 契約中の組織が iOS からも購入できてしまう（二重課金）。
-- ---------------------------------------------------------------------
UPDATE public.organizations
   SET plan_source = 'stripe'
 WHERE plan_source IS NULL
   AND stripe_subscription_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 確認用
-- ---------------------------------------------------------------------
-- SELECT id, plan, plan_source, stripe_subscription_id,
--        apple_original_transaction_id, apple_expires_at
--   FROM public.organizations
--  ORDER BY created_at;
--
-- -- 二重契約が無いこと（0 行になること）
-- SELECT id FROM public.organizations
--  WHERE stripe_subscription_id IS NOT NULL
--    AND apple_original_transaction_id IS NOT NULL;
