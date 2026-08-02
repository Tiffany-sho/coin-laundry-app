-- =====================================================================
-- 担当店舗（メンバーごとに触れる店舗を絞る）
--
--   npx supabase link --project-ref <ref>          -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/011_member_stores.sql
--
-- ⚠️ **Web のデプロイより先に流すこと。** 逆にすると Server Action が
--    存在しないテーブルを引いて 42P01 を返し、集金も在庫も全画面で落ちる。
--
-- ⚠️ **これは認可の変更。** 「担当でない店舗の集金データ・在庫データには
--    一切かかわれない」を DB とサーバの両方で担保する。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① テーブル
--
-- 1 行 = 「この人はこの店舗を担当する」。
--
-- ⚠️ **admin の行は作らない。** admin は常に全店舗を見る。行で表現すると
--    店舗を追加するたびに admin ぶんを足して回る必要が生まれ、
--    **足し忘れた瞬間に管理者が自分の店舗を見られなくなる。**
--    「admin は無条件」はサーバ側の 1 行の分岐で表す。
--
-- ⚠️ **行が 0 件 = 1 店舗も担当しない**（2026-08-03 の決定）。
--    「0 件なら全店舗」にはしない。**ただしそれだと既存メンバーが
--    反映の瞬間に全員締め出される**ので、③ で現在の全店舗を配る。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_stores (
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  laundry_id uuid NOT NULL REFERENCES public.laundry_store(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, laundry_id)
);

-- 「この人の担当店舗」を引く形しか無いので、その並びで 1 本
CREATE INDEX IF NOT EXISTS member_stores_user_idx
  ON public.member_stores (user_id, laundry_id);
-- 組織のメンバー全員ぶんを一覧する（admin の割り当て画面）
CREATE INDEX IF NOT EXISTS member_stores_org_idx
  ON public.member_stores (org_id, user_id);

COMMENT ON TABLE public.member_stores IS
  '担当店舗。1 行 = その人がその店舗を担当する。'
  '⚠️ admin の行は作らない（admin は常に全店舗。サーバ側の分岐で表す）。'
  '⚠️ 行が 0 件のメンバーは 1 店舗も担当しない（＝集金も在庫も何も見えない）。'
  '⚠️ 店舗を新しく作っても自動では配られない。admin が割り当て直す。';

-- ---------------------------------------------------------------------
-- ② RLS
--
-- ⚠️ **PostgreSQL の RLS ポリシーは OR で結合される。** 緩いものを 1 本でも
--    置くと厳しいほうが一度も効かない（006 で実際に踏んだ）。
--    `FOR ALL USING (true)` を絶対に足さないこと。
--
-- ⚠️ **書き込みポリシーは作らない。** 割り当ての変更は Server Action が
--    admin であることを確かめてから service role で行う。
--    ここに INSERT を開けると、**集金担当者が自分に店舗を割り当てられる**
--    ＝この機能の意味が無くなる。
-- ---------------------------------------------------------------------
ALTER TABLE public.member_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS member_stores_select_own_org ON public.member_stores;

-- 自分と同じ組織のぶんだけ読める（admin の割り当て画面が全員ぶんを出すため）
CREATE POLICY member_stores_select_own_org
  ON public.member_stores
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id FROM public.organization_members om
       WHERE om.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- ③ 既存メンバーへ現在の全店舗を配る
--
-- ⚠️ **これが無いと、反映した瞬間に既存の集金担当者が全員締め出される。**
--    「未割り当て = 何も見えない」という規則はそのままに、**今いる人だけ**
--    今までどおりにしておくための 1 回きりの移行。
--
-- ⚠️ **admin には配らない**（①のとおり行を持たせない）。
-- ⚠️ 何度実行しても増えない（ON CONFLICT DO NOTHING）。
-- ---------------------------------------------------------------------
INSERT INTO public.member_stores (org_id, user_id, laundry_id)
SELECT om.org_id, om.user_id, ls.id
  FROM public.organization_members om
  JOIN public.laundry_store ls ON ls.organization_id = om.org_id
 WHERE om.role <> 'admin'
ON CONFLICT (user_id, laundry_id) DO NOTHING;

-- =====================================================================
-- 確認用
--
-- 1) ⚠️ **ポリシーが 1 本だけ**であること（緩いものが混ざっていないこと）。
--    UPDATE / DELETE / INSERT の行が出たら失敗:
--      SELECT polname, polcmd FROM pg_policy
--       WHERE polrelid = 'public.member_stores'::regclass;
--    → member_stores_select_own_org / r（= SELECT）の 1 行だけ
--
-- 2) 既存メンバーに配れたか。⚠️ **admin が 0 件**であること:
--      SELECT om.role, count(ms.*) AS assigned
--        FROM public.organization_members om
--        LEFT JOIN public.member_stores ms ON ms.user_id = om.user_id
--       GROUP BY om.role;
--
-- 3) 非 admin が「その組織の店舗数」と一致しているか:
--      SELECT om.user_id, om.role,
--             (SELECT count(*) FROM public.laundry_store ls
--               WHERE ls.organization_id = om.org_id) AS stores,
--             (SELECT count(*) FROM public.member_stores ms
--               WHERE ms.user_id = om.user_id)        AS assigned
--        FROM public.organization_members om
--       WHERE om.role <> 'admin';
--    → stores と assigned が一致すること
--
-- 4) 取り消す（⚠️ 割り当てが全部消える）
--      DROP TABLE public.member_stores;
-- =====================================================================
