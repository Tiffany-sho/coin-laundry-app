-- =====================================================================
-- 支払方法を「組織ごと」から「店舗ごと」へ移す
--
--   npx supabase link --project-ref <ref>     ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/009_payment_methods_per_store.sql
--
-- 007 で payment_methods は org_id に紐づけていたが、支払方法は店舗ごとに
-- 違う（この店は PayPay だけ、あの店はクレジットカードも）ため店舗へ移す。
-- 登録・編集の口も設定画面から**店舗フォームの中**へ移った。
--
-- 何度流しても同じ結果になるように書いてある（IF NOT EXISTS / 条件付き）。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① 店舗への参照を足す
--
-- ⚠️ **org_id は残す。** RLS のポリシーと「組織の中に閉じているか」の判定に
--    使っている。laundry_id だけにすると、ポリシーが laundry_store を
--    join することになり毎回の SELECT が重くなる。
-- ---------------------------------------------------------------------
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS laundry_id uuid REFERENCES public.laundry_store(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.payment_methods.laundry_id IS
  '店舗。⚠️ 支払方法は店舗ごと（009 で org 単位から移した）。org_id は RLS 用に残してある';

-- ---------------------------------------------------------------------
-- ② UNIQUE を (org_id, name) から (laundry_id, name) へ張り替える
--
-- ⚠️ **先に張り替える。** ③ の複製が ON CONFLICT を使うので、
--    新しい制約が無いと「同じ店舗に同じ名前」を弾けない。
-- ⚠️ この時点では laundry_id が NULL の行が残っているが、UNIQUE は
--    NULL を重複と見なさないので既存行はそのまま通る。
-- ---------------------------------------------------------------------
ALTER TABLE public.payment_methods
  DROP CONSTRAINT IF EXISTS payment_methods_org_id_name_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_methods_laundry_id_name_key'
  ) THEN
    ALTER TABLE public.payment_methods
      ADD CONSTRAINT payment_methods_laundry_id_name_key UNIQUE (laundry_id, name);
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- ③ 既存の「組織ごと」の行を、その組織の**全店舗**へ複製する
--
-- ⚠️ **どれか 1 店舗に寄せない。** 組織単位で作った支払方法は
--    「どの店でも使う」つもりで作られているので、1 店舗に寄せると
--    他店の集金画面から黙って消える。
--
-- ⚠️ **id は新しく振られる。** 過去の collect_funds.cashless[].methodId は
--    複製元の id を指したままになる（＝どの行にも当たらなくなる）。
--    表示は cashless[].name を焼き込んであるので壊れず、支払方法別の集計も
--    **名前で畳む**ように直してあるので影響しない。
--    ⚠️ 逆に言うと、**methodId で過去の集金を引く実装を足さないこと。**
-- ---------------------------------------------------------------------
INSERT INTO public.payment_methods (org_id, laundry_id, name, sort_order, is_active)
SELECT pm.org_id, ls.id, pm.name, pm.sort_order, pm.is_active
  FROM public.payment_methods pm
  JOIN public.laundry_store ls ON ls.organization_id = pm.org_id
 WHERE pm.laundry_id IS NULL
ON CONFLICT (laundry_id, name) DO NOTHING;

-- 複製元（店舗に紐づかない行）を落とす
DELETE FROM public.payment_methods WHERE laundry_id IS NULL;

-- ---------------------------------------------------------------------
-- ④ 以降は店舗必須にする
--
-- ⚠️ ③ で NULL を消し切ってからでないと落ちる。順番を入れ替えないこと。
-- ---------------------------------------------------------------------
ALTER TABLE public.payment_methods
  ALTER COLUMN laundry_id SET NOT NULL;

COMMENT ON TABLE public.payment_methods IS
  '店舗ごとの支払方法（PayPay・クレジットカードなど）。⚠️ 現金は含めない（常に存在する暗黙の方法）';

-- ---------------------------------------------------------------------
-- ⑤ 索引を張り替える
-- ---------------------------------------------------------------------
DROP INDEX IF EXISTS public.payment_methods_org_sort_idx;

CREATE INDEX IF NOT EXISTS payment_methods_laundry_sort_idx
  ON public.payment_methods (laundry_id, sort_order, created_at);

-- ---------------------------------------------------------------------
-- ⑥ RLS は 007 のまま（org_id スコープの SELECT が 1 本だけ）
--
-- ⚠️ **ここに書き込みポリシーを足さない。** 支払方法の作成・変更は
--    BFF（店舗の POST / PATCH）が service role で行う。authenticated から
--    直接書けるようにすると、アプリの anon key + セッションで PostgREST を
--    叩いて他店舗の支払方法を作れてしまう。
--
-- ⚠️ **緩いポリシーを 1 本でも置かないこと。** RLS は OR で結合されるので
--    `USING (true)` が 1 本あると厳しい方は一度も効かない（006 の教訓）。
--
-- org_id スコープのままでよい理由: laundry_id は必ず同じ組織の店舗を指す
-- （BFF が組織の店舗一覧に無い laundryId を弾く）。したがって
-- 「自分の組織の行だけ読める」で過不足ない。
-- ---------------------------------------------------------------------

-- =====================================================================
-- 確認用
--
-- 1) laundry_id が付いて NOT NULL になったこと
--      SELECT column_name, is_nullable FROM information_schema.columns
--       WHERE table_name = 'payment_methods' AND column_name = 'laundry_id';
--    → laundry_id / NO
--
-- 2) 店舗に紐づかない行が残っていないこと
--      SELECT count(*) FROM public.payment_methods WHERE laundry_id IS NULL;
--    → 0
--
-- 3) 制約が張り替わったこと
--      SELECT conname FROM pg_constraint
--       WHERE conrelid = 'public.payment_methods'::regclass AND contype = 'u';
--    → payment_methods_laundry_id_name_key のみ
--      （payment_methods_org_id_name_key が**残っていない**こと）
--
-- 4) ⚠️ ポリシーが **SELECT の 1 本だけ**であること（007 から変わっていない）
--      SELECT policyname, cmd FROM pg_policies
--       WHERE tablename = 'payment_methods' ORDER BY cmd;
--    → payment_methods_select_own_org (SELECT) のみ
--
-- 5) 複製の結果（組織に支払方法があった場合）
--      SELECT ls.store, pm.name, pm.is_active
--        FROM public.payment_methods pm
--        JOIN public.laundry_store ls ON ls.id = pm.laundry_id
--       ORDER BY ls.store, pm.sort_order;
--    → 組織の全店舗ぶんに同じ名前が並んでいること
-- =====================================================================
