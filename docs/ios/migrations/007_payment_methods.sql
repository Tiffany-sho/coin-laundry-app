-- =====================================================================
-- 支払方法（現金以外の決済を集金レコードに残せるようにする）
--
--   npx supabase link --project-ref <ref>     ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/007_payment_methods.sql
--
-- 追加のみ。既存の列・行・Web の挙動は変更しない。
-- IF NOT EXISTS / DROP POLICY IF EXISTS を付けてあるので何度流しても同じ結果になる。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 支払方法（組織ごと）
--
-- ⚠️ **現金はこのテーブルに入れない。** 常に存在する暗黙の方法として扱い、
--    現金額 = collect_funds.totalFunds − sum(cashless[].amount) で出す。
--    行として持つと「現金を無効化できてしまう」「二重に数える」の両方が起きる。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  -- ⚠️ 削除は物理削除にしない（過去の cashless が methodId で参照している）。
  --    使わなくなったものは is_active = false にする。
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

COMMENT ON TABLE public.payment_methods IS
  '組織ごとの支払方法（PayPay・クレジットカードなど）。⚠️ 現金は含めない（常に存在する暗黙の方法）';

CREATE INDEX IF NOT EXISTS payment_methods_org_sort_idx
  ON public.payment_methods (org_id, sort_order, created_at);

-- ---------------------------------------------------------------------
-- ② 集金レコードにキャッシュレスの内訳を持たせる
--
-- 形: [{ "methodId": "<uuid>", "name": "PayPay", "amount": 12400 }]
--
-- ⚠️ **amount の単位は「円」。** 同じ行の fundsArray[].funds は**硬貨の枚数**で、
--    金額にするには × 100 が要る。**この 2 つを取り違えると 1/100 になる。**
--
-- ⚠️ **name も一緒に保存する**（fundsArray と同じ理由）。支払方法を
--    使わなくしても、過去の集金が名前を失わないようにするため。
--
-- ⚠️ **子テーブルにしない。** 集金の登録は 1 行の INSERT と
--    client_request_id の部分ユニークだけで冪等性を担保している（001）。
--    子テーブルにすると、オフライン再送で片方だけ入る事故が起きる。
--
-- ⚠️ **不変条件**（サーバ側で必ず組み直すこと。クライアントの値を信じない）:
--      totalFunds = 現金ぶん + sum(cashless[].amount)
--    現金ぶんは「fundsArray の枚数の和 × 100」（機種別入力）か
--    「入力された合計金額」（合計入力）。
-- ---------------------------------------------------------------------
ALTER TABLE public.collect_funds
  ADD COLUMN IF NOT EXISTS cashless jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.collect_funds.cashless IS
  'キャッシュレス決済の内訳 [{methodId,name,amount}]。⚠️ amount は「円」（fundsArray.funds は枚数なので単位が違う）。totalFunds はこれを含んだ総額';

-- ---------------------------------------------------------------------
-- ③ RLS
--
-- ⚠️ **緩いポリシーを 1 本でも置かないこと。** PostgreSQL の RLS ポリシーは
--    OR で結合されるので、`USING (true)` が 1 本あると厳しい方は
--    **一度も効かない**（006 で実際に起きた。「対策済みに見えて無効」の形）。
--
-- ⚠️ **書き込みポリシーは作らない。** 支払方法の作成・変更は BFF
--    （/api/v1/org/payment-methods）が service role で行う。authenticated から
--    直接書けるようにすると、アプリの anon key + セッションで PostgREST を
--    叩いて他組織の支払方法を作れてしまう。
--    ⚠️ service role は RLS を通らないので BFF は影響を受けない。
--    ⚠️ 将来 Web に管理画面を足すときは、**必ず service role 経由**にすること。
--       利用者のクライアントで書こうとすると 42501 で静かに失敗する。
-- ---------------------------------------------------------------------
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- ⚠️ CREATE POLICY に IF NOT EXISTS は無いので、先に落としてから作る
--    （これが無いと 2 回目の実行が「already exists」で失敗する）
DROP POLICY IF EXISTS payment_methods_select_own_org ON public.payment_methods;

CREATE POLICY payment_methods_select_own_org
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 確認用
--
-- 1) 列が付いたこと
--      SELECT column_name, data_type, column_default
--        FROM information_schema.columns
--       WHERE table_name = 'collect_funds' AND column_name = 'cashless';
--    → jsonb / '[]'::jsonb
--
-- 2) 既存行が空配列で埋まっていること（NULL が無いこと）
--      SELECT count(*) FROM public.collect_funds WHERE cashless IS NULL;
--    → 0
--
-- 3) ⚠️ ポリシーが **SELECT の 1 本だけ**であること
--      SELECT policyname, cmd FROM pg_policies
--       WHERE tablename = 'payment_methods' ORDER BY cmd;
--    → payment_methods_select_own_org (SELECT) のみ。
--      INSERT / UPDATE / DELETE の行が**無い**ことを確かめる
--
-- 4) RLS が有効であること
--      SELECT relrowsecurity FROM pg_class WHERE relname = 'payment_methods';
--    → t
-- =====================================================================
