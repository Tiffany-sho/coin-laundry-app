-- 013: 組織への参加を「申請 → 店舗管理者が承認」に変える（2026-08-06）
--
-- それまでの経路は 2 つあった。どちらも 013 で畳む。
--
--   1. メール招待 … admin がメールを入れ、token 付きのリンクを送る
--      ⚠️ 相手が Collecie に登録済みでないと送れず、届かない・迷惑メールに入る、
--         リンクの有効期限が切れる、と詰まりどころが多かった。
--   2. 参加パスワード … 従業員が「admin のメール + 参加パスワード」で**即座に参加**
--      ⚠️ admin が一度配れば誰でも使えるので、実質的に無期限の合鍵だった。
--
-- 新しい経路は 1 本だけ。
--
--   従業員が「管理者のメール」を入れて申請 → **店舗管理者（admin）**が権限を選んで承認
--
-- ⚠️ **承認できるのは admin。** メンバーの権限変更・削除と同じ条件。
--    ⚠️ **オーナー（organizations.owner_id）限定にしない。** オーナーは組織を
--       作った 1 人だけで**譲渡する手段が無い**ため、限定すると
--       **オーナー不在の間は誰も組織に参加できなくなる。**
--
-- 適用:
--   npx supabase link --project-ref <ref>      -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/migrations/013_join_requests.sql

CREATE TABLE IF NOT EXISTS public.organization_join_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- 申請した人。⚠️ 退会したら申請ごと消す（承認しても入れないため）
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  decided_at  timestamptz,
  -- 承認・却下した人。⚠️ ON DELETE SET NULL（その人が抜けても履歴を残す）
  decided_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.organization_join_requests IS
  '組織への参加申請。従業員が出し、店舗管理者（role = admin）が承認できる。'
  ' 承認時に権限（collecter / viewer）を選ぶので、この表には権限を持たせない。';

/*
  ⚠️ **同じ組織へ pending を 2 つ作らせない。** 部分ユニークにしてあるので、
     却下されたあとに出し直すことはできる（status が変われば重複しない）。
     ⚠️ 全体ユニークにすると「一度断られたら二度と申請できない」になる。
*/
CREATE UNIQUE INDEX IF NOT EXISTS organization_join_requests_pending_uniq
  ON public.organization_join_requests (org_id, user_id)
  WHERE status = 'pending';

/* 店舗管理者が自分の組織の保留中を引くための索引 */
CREATE INDEX IF NOT EXISTS organization_join_requests_org_status_idx
  ON public.organization_join_requests (org_id, status);

ALTER TABLE public.organization_join_requests ENABLE ROW LEVEL SECURITY;

/*
  ⚠️ **PostgreSQL の RLS ポリシーは OR で結合される。** 緩いものを 1 本でも置くと
     厳しいほうが一度も効かなくなる（006 で実際にそうなっていた）。
     **`FOR ALL USING (true)` を絶対に置かないこと。**

  ⚠️ ここに置くのは「本人が自分の申請を読む・出す」だけ。
     **一覧・承認・却下は Server Action が service role で行う**ので、
     承認する側向けの SELECT ポリシーは要らない（作ると可視範囲が広がるだけ）。
  ⚠️ **UPDATE / DELETE のポリシーは作らない。** 申請者が自分で
     `status` を 'approved' に書き換えられてしまう。
*/
DROP POLICY IF EXISTS "join_requests_select_own" ON public.organization_join_requests;
CREATE POLICY "join_requests_select_own"
  ON public.organization_join_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

/*
  ⚠️ `user_id = auth.uid()` で自分の行しか作れないようにする。
     これが無いと他人の名義で申請を作れる。
  ⚠️ **`status` は既定の 'pending' に任せず、ここでも縛る。**
     縛らないと INSERT の時点で 'approved' を指定できてしまう。
*/
DROP POLICY IF EXISTS "join_requests_insert_own" ON public.organization_join_requests;
CREATE POLICY "join_requests_insert_own"
  ON public.organization_join_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

/*
  ⚠️ **`organizations.join_password` は列ごと残す。**
     使うのをやめただけで、DROP すると戻せない。
     ⚠️ **新しく参照するコードを書かないこと**（合鍵が復活する）。

  ⚠️ **`organization_invitations` も残す。** 保留中の招待が入っている環境が
     あり、消すと「誰を招待したか」の記録ごと失われる。
     ⚠️ **こちらも新しく参照しないこと。** UI と API は 013 と同じリリースで外した。
*/

-- 確認クエリ
--   ⚠️ ポリシーが 2 本だけであること（緩いものが混ざっていないこと）
-- SELECT policyname, cmd, qual, with_check
--   FROM pg_policies WHERE tablename = 'organization_join_requests' ORDER BY policyname;
--
--   ⚠️ 部分ユニークが「pending のときだけ」であること
-- SELECT indexname, indexdef FROM pg_indexes
--   WHERE tablename = 'organization_join_requests';
