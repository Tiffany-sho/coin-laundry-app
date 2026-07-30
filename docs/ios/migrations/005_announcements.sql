-- =====================================================================
-- Collecie「開発者からのお知らせ」
--   Supabase ダッシュボード > SQL Editor で実行する。
--
-- 001〜004 とは独立。どれを当てていなくても実行できる。
-- 新しいテーブルを 1 つ作るだけで、既存データには触れない。
--
-- ⚠️ **投稿は Supabase の Table Editor から手で行う。** 管理画面は作っていない。
--    Table Editor は service role で動くので、下の RLS を素通りして書き込める。
-- =====================================================================

-- ---------------------------------------------------------------------
-- ① テーブル
--
-- category は表示のバッジ色を決めるだけ。増やすときは
-- アプリ側（src/components/settings/announcementMeta.ts）も一緒に直すこと。
-- ⚠️ 知らない値が来ても落ちないようにアプリ側で既定へ倒しているので、
--    CHECK は付けていない（付けると Table Editor での投稿が失敗しやすくなる）。
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 一覧の並び順と「未読」の判定に使う。⚠️ 過去日を入れれば下の方に出せる
  published_at timestamptz NOT NULL DEFAULT now(),
  -- 'info' | 'feature' | 'maintenance' | 'incident'
  category     text NOT NULL DEFAULT 'info',
  title        text NOT NULL,
  -- ⚠️ プレーンテキスト。改行はそのまま出す（Markdown は解釈しない）
  body         text NOT NULL,
  -- メンテ告知など、過ぎたら自動で下げたいもの。NULL = ずっと出す
  expires_at   timestamptz,
  -- ⚠️ 既定は false（下書き）。書き終えてから true にする
  published    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 一覧は「公開中のものを新しい順」でしか引かないので、その形の索引を 1 本
CREATE INDEX IF NOT EXISTS announcements_published_idx
  ON public.announcements (published, published_at DESC);

-- ---------------------------------------------------------------------
-- ② RLS
--
-- ⚠️ **読めるのは「公開中かつ期限内」のものだけ。** 下書きが漏れると、
--    書きかけの文面や日付未定のメンテ告知がそのままアプリに出る。
--
-- ⚠️ **書き込みポリシーは作らない。** つまり anon / authenticated からは
--    INSERT / UPDATE / DELETE が一切できない。投稿は service role
--    （Supabase の Table Editor と BFF のサービスクライアント）だけが行える。
--    ここに書き込みポリシーを足すと、アプリのトークンでお知らせを
--    捏造できるようになる。
-- ---------------------------------------------------------------------
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS announcements_read_published ON public.announcements;

CREATE POLICY announcements_read_published
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    published = true
    AND (expires_at IS NULL OR expires_at > now())
  );

-- ---------------------------------------------------------------------
-- ③ 最初の 1 件
--
-- ⚠️ **空のまま審査に出さない。** 審査員がこの画面を開いても何も出ず、
--    機能が動いていないのか中身が無いのか区別が付かない。
--
-- ⚠️ **本文に価格・プラン・外部サイトのことを書かない**（Guideline 3.1.3(a)）。
--    「Pro プランは◯◯円」「Web サイトから契約できます」はいずれもリジェクト事由。
--    これはこの 1 件だけでなく、今後投稿するすべてに当てはまる。
--
-- ⚠️ **アプリに無い導線を書かない。** 最初は「ご意見は設定画面からお送りいただけます」と
--    書いていたが、フィードバックの画面は**Web にしかなくアプリには無い**。
--    審査員が設定を探して見つからないことになる。文面を足すときは、
--    その導線がアプリに実在するか必ず確かめること。
-- ---------------------------------------------------------------------
INSERT INTO public.announcements (category, title, body, published)
SELECT
  'info',
  'Collecie をご利用いただきありがとうございます',
  E'このページでは、アプリの新機能や不具合の対応状況をお知らせします。\n\n新しいお知らせがあるときは、設定画面の「開発者からのお知らせ」に件数が表示されます。',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.announcements);

-- =====================================================================
-- 確認用
--
-- 1) テーブルと索引ができているか
--      SELECT count(*) FROM public.announcements;
--
-- 2) RLS が効いているか（⚠️ SQL Editor は service role なので**素通りする**。
--    ここで下書きが見えても異常ではない）。実際の確認はアプリか、
--    未認証で BFF を叩いて 401 が返ることで行う:
--      curl -s https://www.collecie.com/api/v1/announcements
--      → {"error":{"message":"ログインしてください","code":"UNAUTHENTICATED"}}
--
-- 3) 下書きが漏れていないか。published = false の行を 1 つ作ってから
--    アプリを開き、出ないことを確かめる
-- =====================================================================
