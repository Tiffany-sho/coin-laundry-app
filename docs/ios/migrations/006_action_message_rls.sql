-- =====================================================================
-- アクションログ（action_message）の RLS を締める
--
-- 001〜005 とは独立。テーブルは既にあるので、**ポリシーだけを入れ替える。**
-- 行は 1 件も触らない。
--
-- ---------------------------------------------------------------------
-- なぜ要るか
--
-- 2026-07-31 時点の本番は、authenticated に対して次の 4 本が
-- すべて `USING (true)` / `WITH CHECK (true)` で開いていた。
--
--   SELECT / INSERT / UPDATE / DELETE … すべて true
--
-- ⚠️ **PostgreSQL の RLS ポリシーは OR で結合される。** したがって
--    別に用意されていた厳しいポリシー（org members can read org logs）は
--    **一度も効いていなかった。** 緩い方が常に勝つ。
--
-- この状態で起きること:
--   - ⚠️ 他組織のアクションログが**全部読める**（SELECT true）
--   - ⚠️ `user` と `org_id` を**任意に指定して INSERT できる**
--     ＝**他人がやったことにしてログを捏造できる。**
--        「誰のアクションか」を示すための機能が、その一点で無意味になる
--   - ⚠️ 既存のログを**書き換え・削除できる**（監査ログとして成立しない）
--
-- アプリは anon key と利用者のセッションを持っていて PostgREST を直接
-- 叩けるので、これは机上の話ではない。
-- ---------------------------------------------------------------------

ALTER TABLE public.action_message ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- ① 緩いポリシーを落とす
--
-- ⚠️ 名前は本番に実在するものをそのまま書いている（"deletefor" の
--    詰まりも原文ママ）。変えると DROP が空振りして**緩いまま残る。**
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.action_message;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.action_message;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.action_message;
DROP POLICY IF EXISTS "Enable deletefor authenticated users only"  ON public.action_message;

-- ---------------------------------------------------------------------
-- ② 読み取り: 自分の組織のログ、または自分自身の行だけ
--
-- 組織未所属の期間に作られた行は org_id が NULL になる。そういう行は
-- 本人だけが見られる（`"user" = auth.uid()` の側で拾う）。
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "org members can read org logs" ON public.action_message;
-- ⚠️ 新しい名前も先に落とす。CREATE POLICY に IF NOT EXISTS は無いので、
--    これが無いと 2 回目の実行が「already exists」で失敗する（005 と同じく
--    何度流しても同じ結果になるようにしておく）
DROP POLICY IF EXISTS action_message_select_own_org ON public.action_message;

CREATE POLICY action_message_select_own_org
  ON public.action_message
  FOR SELECT
  TO authenticated
  USING (
    "user" = auth.uid()
    OR org_id IN (
      SELECT om.org_id FROM public.organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- ③ 書き込み: 「自分として」「自分の組織に」だけ
--
-- ⚠️ **`"user" = auth.uid()` が要。** これが無いと他人の名前でログを
--    作れてしまう（この機能の存在意義が消える）。
--
-- ⚠️ 文面（message）の中身までは縛れない。Web は showToast() の文字列を
--    そのまま入れており、クライアント側で組み立てている。
--    **アプリ（BFF 経由）の分はサーバで組み立てること**（body の値を使わない）。
--    docs/ios/06-api-bff.md の記録を参照。
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS action_message_insert_self ON public.action_message;

CREATE POLICY action_message_insert_self
  ON public.action_message
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "user" = auth.uid()
    AND (
      org_id IS NULL
      OR org_id IN (
        SELECT om.org_id FROM public.organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------
-- ④ UPDATE / DELETE のポリシーは**作らない**
--
-- 監査ログなので後から書き換えられてはいけない。ポリシーが無ければ
-- authenticated からは一切実行できない。
--
-- ⚠️ **service role は RLS を通らないので影響を受けない。**
--    実際に消しているのは次の 2 か所で、どちらも serviceSupabase 経由:
--      - account/action.js  … アカウント削除時に org のログを消す
--      - organization/action.js … 組織削除時に org のログを消す
--    ここを RLS で塞いでもあちらは動き続ける（確認済み）。
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- ⑤ 一覧の索引
--
-- 画面は「自分の組織のログを新しい順に N 件」しか引かない。
-- ⚠️ ログは放っておくと増え続ける。索引が無いと組織が育つほど遅くなる。
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS action_message_org_date_idx
  ON public.action_message (org_id, date DESC);

-- =====================================================================
-- 確認用
--
-- 1) 緩いポリシーが消え、2 本だけになっていること
--      SELECT policyname, cmd FROM pg_policies
--      WHERE tablename = 'action_message' ORDER BY cmd;
--    → action_message_insert_self (INSERT) / action_message_select_own_org (SELECT)
--    ⚠️ UPDATE と DELETE の行が**無い**ことを確かめる
--
-- 2) 他人になりすませないこと（アプリのトークンで PostgREST を直接叩く）
--      POST /rest/v1/action_message  { "user": "<他人のuuid>", ... }
--    → 42501 new row violates row-level security policy
-- =====================================================================
