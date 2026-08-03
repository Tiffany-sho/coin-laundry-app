-- =====================================================================
-- 経費を使うかどうかを組織ごとに持つ（organizations.expenses_enabled）
--
--   npx supabase link --project-ref <ref>          -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/012_expenses_enabled.sql
--
-- ⚠️ **Web のデプロイより先に流すこと。** 逆にすると `getMyOrganization` が
--    存在しない列を select して PostgREST が 42703 を返し、**bootstrap ごと
--    失敗して全画面が止まる。**（003 で実際に起きた順序）
--
-- ---------------------------------------------------------------------
-- なぜ組織ごとなのか
--
--   経費は組織のデータ（全員が同じ数字を見る）。利用者ごとに持たせると、
--   同じ組織なのに人によって収益ページのタブの本数が変わり、
--   「利益が出ない」と言われた側が原因を追えなくなる。
--   したがって**管理者が組織に対して 1 つ決める。**
--
-- ⚠️ **既定は true。** 既に経費を入れている組織があるので、false にすると
--    **アップデートした瞬間に入力済みの経費が画面から消える。**
--    「使わない」は初期設定で選ぶか、設定画面で明示的に切る操作のときだけ。
--
-- ⚠️ **これは表示の設定であって認可ではない。** 切っても `expenses` /
--    `recurring_expenses` の行は消えないし、API も 403 にしない。
--    戻したときに以前の記録がそのまま出るのが正しい挙動で、
--    途中で切られた端末が永久に 403 を受け続ける事故も防げる。
--    ⚠️ したがって**プランの制限のようにサーバで強制するものと混同しない。**
-- =====================================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS expenses_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.organizations.expenses_enabled IS
  '経費の機能を使うか。⚠️ 表示の設定であって認可ではない（false でも行は消えず API も 403 にしない）。'
  '⚠️ 既定は true。false を既定にすると、入力済みの経費が画面から消える。'
  '変更できるのは admin のみ（Server Action 側で確認している）。';

-- =====================================================================
-- 確認用
--
-- 1) 列が付いたか。⚠️ **既存の行がすべて true になっていること**
--      SELECT expenses_enabled, count(*)
--        FROM public.organizations GROUP BY 1;
--      -- → true | <組織数>   （false の行が 1 つでもあれば既定がおかしい）
--
-- 2) NOT NULL と既定値
--      SELECT column_name, is_nullable, column_default
--        FROM information_schema.columns
--       WHERE table_name = 'organizations' AND column_name = 'expenses_enabled';
--      -- → expenses_enabled | NO | true
--
-- 3) ⚠️ **RLS ポリシーを足していないこと**（organizations の既存ポリシーで読める）。
--      SELECT policyname, cmd FROM pg_policies
--       WHERE schemaname = 'public' AND tablename = 'organizations';
--      -- → 012 の前後で本数が変わらないこと。
--         ⚠️ ポリシーは OR で結合されるので、ここで緩いものを足すと
--            既存の厳しいポリシーが一度も効かなくなる（006 の教訓）。
-- =====================================================================
