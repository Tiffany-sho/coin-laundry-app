-- =====================================================================
-- Pro+ プラン（10 店舗）を organizations.plan に足す
--
--   npx supabase link --project-ref <ref>          -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/010_plan_proplus.sql
--
-- ⚠️ **Web のデプロイより先に流すこと。** 逆にすると、Pro+ を購入した瞬間に
--    CHECK に弾かれて organizations の UPDATE ごと失敗する。
--    003 の順序（マイグレーション → Web → アプリ）と同じ。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 既存の plan の CHECK 制約を落とす
--
-- ⚠️ **制約の名前が分からないので探して消す。** `organizations_plan_check` を
--    決め打ちで DROP IF EXISTS すると、別名で付いていた場合に**古い制約が
--    残ったまま新しい制約が増える。**CHECK は AND で結合されるので、
--    古いほうが 'proplus' を弾き続ける（RLS の OR と逆で、こちらは厳しいほうが勝つ）。
--
-- ⚠️ plan_source の制約（003）を巻き添えにしない。定義に 'plan_source' を
--    含むものは除外している。
-- ---------------------------------------------------------------------
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
     WHERE conrelid = 'public.organizations'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%plan%'
       AND pg_get_constraintdef(oid) NOT ILIKE '%plan_source%'
  LOOP
    RAISE NOTICE '落とす制約: % => %', c.conname, c.def;
    EXECUTE format('ALTER TABLE public.organizations DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- ② 4 つのプランを明示的に許す
--
-- もともと CHECK が無かった場合、これは「制約を足す」変更になる。
-- ⚠️ **無いままにしない。** 商品 ID とプランキーの綴り違い（`pro_plus` など）を
--    DB が受け取ってしまうと、購入は成立するのに PLAN_LIMITS の引きが
--    undefined になって**店舗を 1 件も作れない組織**ができる。
--    型エラーも実行時エラーも出ないので、DB で止めるのが唯一の防波堤。
--
-- ⚠️ キーは Apple の商品 ID の中身と揃えてある:
--      pro     ← com.collecie.app.pro.monthly
--      proplus ← com.collecie.app.proplus.monthly
--      max     ← com.collecie.app.max.monthly
-- ---------------------------------------------------------------------
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'proplus', 'max'));

COMMENT ON COLUMN public.organizations.plan IS
  'free / pro / proplus / max。⚠️ Apple の商品 ID の中身と同じ綴りにすること'
  '（PLAN_BY_PRODUCT_ID がこの値を入れる）。'
  '⚠️ 上限は Web の src/functions/plans.js が正。アプリ側の値は表示専用。';

-- =====================================================================
-- 確認用
--
-- 1) 制約が 1 本だけになっているか（plan_source のぶんは別に 1 本ある）
--      SELECT conname, pg_get_constraintdef(oid)
--        FROM pg_constraint
--       WHERE conrelid = 'public.organizations'::regclass AND contype = 'c';
--
-- 2) 既存の行が全部通るか（0 行なら OK。1 行でも出たら ② が失敗しているはず）
--      SELECT plan, count(*) FROM public.organizations GROUP BY plan;
--
-- 3) ⚠️ 綴り違いが弾かれるか。**必ずロールバックすること**
--      BEGIN;
--      UPDATE public.organizations SET plan = 'pro_plus' WHERE id = (SELECT id FROM public.organizations LIMIT 1);
--      -- → new row for relation "organizations" violates check constraint
--      ROLLBACK;
-- =====================================================================
