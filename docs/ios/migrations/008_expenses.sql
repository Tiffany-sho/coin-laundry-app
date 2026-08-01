-- =====================================================================
-- 経費（個人事業者向け）
--
--   npx supabase link --project-ref <ref>     ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/008_expenses.sql
--
-- 単発の経費（在庫の仕入れ・修理代など）と、毎月かかる固定費（家賃・水道光熱費）の
-- 2 本立て。新規テーブルの追加のみで、既存の列・行・Web の挙動は変更しない。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 単発の経費
--
-- ⚠️ **`amount` の単位は「円」。** 同じ DB の collect_funds.fundsArray[].funds は
--    **硬貨の枚数**（金額は × 100）。**取り違えると 1/100 または 100 倍になる。**
--
-- ⚠️ **`date` は collect_funds.date と同じ規約**＝**JST 深夜 0 時の epoch（ミリ秒）**。
--    timestamptz にしないこと。片方だけ型を変えると、収益と経費を同じ期間で
--    突き合わせたときに**境目の 1 日がずれる**（下限を UTC の「今」から引くと
--    JST の 1 日の途中に落ちる、というのが既知の事故）。
--
-- ⚠️ **`laundry_id` が NULL なら「組織全体の経費」。** 店舗に紐づかない支出
--    （税理士費用など）を持たせるため。NOT NULL にしないこと。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  laundry_id uuid REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  date       bigint NOT NULL,
  amount     integer NOT NULL CHECK (amount >= 0),
  category   text NOT NULL,
  note       text,
  -- ⚠️ 退会しても経費は残す（消すと年度の集計に穴が開く）。collect_funds.collecter と同じ扱い
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.expenses.amount IS
  '円。⚠️ collect_funds.fundsArray[].funds は硬貨の枚数なので単位が違う';
COMMENT ON COLUMN public.expenses.date IS
  'JST 深夜 0 時の epoch（ミリ秒）。⚠️ collect_funds.date と同じ規約。timestamptz にしない';
COMMENT ON COLUMN public.expenses.laundry_id IS
  'NULL = 組織全体の経費（店舗に紐づかない支出）';

-- ⚠️ 一覧は必ず期間で切る（PostgREST の 1000 行上限）。その索引
CREATE INDEX IF NOT EXISTS expenses_org_date_idx
  ON public.expenses (org_id, date DESC);

-- ---------------------------------------------------------------------
-- ② 毎月の固定費（**定義だけ**。行は生成しない）
--
-- ⚠️ **pg_cron で expenses の行を作らない。** 004 の経路
--    （pg_cron → pg_net → Edge Function）は失敗が 2 つのテーブルに分かれて
--    記録されるほど追いにくく、経費が黙って欠ける／二重に入る事故のほうが高くつく。
--    読むときに [start_month, end_month] の各月へ展開する。
--
-- ⚠️ **展開した行は編集・削除できない**（実体が無いため）。金額が変わったら
--    既存の定義に end_month を入れて終わらせ、新しい定義を作る。画面でそう案内する。
--
-- ⚠️ **`day_of_month` は 28 まで。** 29〜31 は存在しない月があり、
--    「その月だけ計上されない」という形で静かに欠ける。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  laundry_id   uuid REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  name         text NOT NULL,
  amount       integer NOT NULL CHECK (amount >= 0),
  category     text NOT NULL,
  day_of_month smallint NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  -- 'YYYY-MM'。⚠️ 文字列で持つのは月単位の比較を辞書順で済ませるため
  start_month  text NOT NULL CHECK (start_month ~ '^\d{4}-\d{2}$'),
  end_month    text CHECK (end_month IS NULL OR end_month ~ '^\d{4}-\d{2}$'),
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- 終了月が開始月より前だと、どの月にも展開されない定義ができてしまう
  CONSTRAINT recurring_expenses_period_check
    CHECK (end_month IS NULL OR end_month >= start_month)
);

COMMENT ON TABLE public.recurring_expenses IS
  '毎月の固定費の定義。⚠️ 実体の行は作らない（読むときに月へ展開する）';
COMMENT ON COLUMN public.recurring_expenses.amount IS '円。⚠️ 硬貨の枚数ではない';
COMMENT ON COLUMN public.recurring_expenses.day_of_month IS
  '1〜28。⚠️ 29 以上を許すと、その日が無い月で計上が飛ぶ';

CREATE INDEX IF NOT EXISTS recurring_expenses_org_idx
  ON public.recurring_expenses (org_id, start_month);

-- ---------------------------------------------------------------------
-- ③ RLS
--
-- ⚠️ **緩いポリシーを 1 本でも置かないこと。** RLS ポリシーは OR で結合されるので、
--    `USING (true)` が 1 本あると厳しい方は**一度も効かない**（006 の教訓）。
--
-- ⚠️ **書き込みポリシーは作らない。** 経費の作成・編集・削除は BFF が
--    service role で行う。authenticated から直接書けるようにすると、
--    アプリの anon key + セッションで PostgREST を叩いて
--    **他組織の経費を作れてしまう。**
--    ⚠️ service role は RLS を通らないので BFF は影響を受けない。
-- ---------------------------------------------------------------------
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- ⚠️ CREATE POLICY に IF NOT EXISTS は無いので、先に落としてから作る
DROP POLICY IF EXISTS expenses_select_own_org ON public.expenses;
CREATE POLICY expenses_select_own_org
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS recurring_expenses_select_own_org ON public.recurring_expenses;
CREATE POLICY recurring_expenses_select_own_org
  ON public.recurring_expenses
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
-- 1) テーブルができたこと
--      SELECT table_name FROM information_schema.tables
--       WHERE table_name IN ('expenses', 'recurring_expenses');
--
-- 2) ⚠️ ポリシーが **各テーブル SELECT の 1 本だけ**であること
--      SELECT tablename, policyname, cmd FROM pg_policies
--       WHERE tablename IN ('expenses', 'recurring_expenses') ORDER BY tablename, cmd;
--    → expenses_select_own_org (SELECT) / recurring_expenses_select_own_org (SELECT)
--      INSERT / UPDATE / DELETE の行が**無い**ことを確かめる
--
-- 3) RLS が有効であること
--      SELECT relname, relrowsecurity FROM pg_class
--       WHERE relname IN ('expenses', 'recurring_expenses');
--    → どちらも t
--
-- 4) day_of_month の上限が効くこと（29 が弾かれる）
--      INSERT INTO public.recurring_expenses
--        (org_id, name, amount, category, day_of_month, start_month)
--      VALUES ('<org>', 'test', 1, 'その他', 29, '2026-08');
--    → new row violates check constraint
-- =====================================================================
