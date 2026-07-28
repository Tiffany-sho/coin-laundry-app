-- =====================================================================
-- Collecie iOS Phase 3 用マイグレーション
--   Supabase ダッシュボード > SQL Editor で実行する。
--
-- ① は「アカウント削除」に必須（App Store Guideline 5.1.1(v)）。
-- ② ③ はプッシュ通知用。通知を実装するまでは無くても動く。
--
-- すべて追加・制約緩和のみ。既存データは変更しない。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 退会ユーザーの集金記録を残す（設計図 15章 決定事項 1）
--
-- 過去の集金記録を消すと組織の売上履歴に穴が開く。そこでレコードは残し、
-- collecter だけを NULL にして「退会済みユーザー」と表示する方針にした。
-- そのために NULL を許容し、参照先が消えたら自動で NULL になるようにする。
-- ---------------------------------------------------------------------
ALTER TABLE public.collect_funds
  ALTER COLUMN collecter DROP NOT NULL;

-- FK を ON DELETE SET NULL に張り替える。
-- 制約名は既存コードが参照しているもの（profiles!collect_funds_collecter_fkey）を維持する。
ALTER TABLE public.collect_funds
  DROP CONSTRAINT IF EXISTS collect_funds_collecter_fkey;

ALTER TABLE public.collect_funds
  ADD CONSTRAINT collect_funds_collecter_fkey
  FOREIGN KEY (collecter) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- ② プッシュ通知トークン
-- ---------------------------------------------------------------------
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

DROP POLICY IF EXISTS device_tokens_own ON public.device_tokens;
CREATE POLICY device_tokens_own ON public.device_tokens
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- ③ 通知設定（ユーザー単位）
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb
  DEFAULT '{"collectReminder":true,"lowStock":true,"machineBreak":true,"reminderHour":8}'::jsonb;

-- ---------------------------------------------------------------------
-- 確認用
-- ---------------------------------------------------------------------
-- SELECT is_nullable FROM information_schema.columns
--  WHERE table_name = 'collect_funds' AND column_name = 'collecter';   -- YES になること
--
-- SELECT confdeltype FROM pg_constraint
--  WHERE conname = 'collect_funds_collecter_fkey';                      -- 'n' (SET NULL) になること
