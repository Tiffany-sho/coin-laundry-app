-- =====================================================================
-- Collecie iOS Phase 2 用マイグレーション
--   Supabase ダッシュボード > SQL Editor に貼って実行する。
--
-- すべて「追加」のみで、既存カラム・既存データ・Web の挙動は変更しない。
-- IF NOT EXISTS を付けてあるので複数回流しても安全。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 冪等性キー（設計図 6.4）
--
-- オフライン送信キューは「送信したがレスポンスを受け取れなかった」場合に必ず再送する。
-- 現行の登録は date にランダムジッターを足しているため、同じ入力が 2 件別レコードで
-- 入ってしまい、集金額が二重計上される。それを DB レベルで防ぐ。
--
-- 部分ユニークインデックスなので、client_request_id が NULL の既存行や
-- Web からの登録は一切影響を受けない。
-- ---------------------------------------------------------------------
ALTER TABLE public.collect_funds
  ADD COLUMN IF NOT EXISTS client_request_id text;

CREATE UNIQUE INDEX IF NOT EXISTS collect_funds_client_request_id_uniq
  ON public.collect_funds (client_request_id)
  WHERE client_request_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- ② 一覧・無限スクロール用の複合インデックス（設計図 8.3）
--
-- getStoreFundsPaginated / getOrgCollectFundsInPeriod は
-- laundryId で絞って date で並べる。Web の一覧表示にも効く。
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS collect_funds_laundry_date_idx
  ON public.collect_funds ("laundryId", date DESC);

-- ---------------------------------------------------------------------
-- 確認用
-- ---------------------------------------------------------------------
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--  WHERE table_name = 'collect_funds' AND column_name = 'client_request_id';
--
-- SELECT indexname FROM pg_indexes
--  WHERE tablename = 'collect_funds'
--    AND indexname IN ('collect_funds_client_request_id_uniq',
--                      'collect_funds_laundry_date_idx');
