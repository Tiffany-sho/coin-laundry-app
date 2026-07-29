-- =====================================================================
-- 集金リマインダの定期起動（pg_cron → Edge Function）
--
-- 前提:
--   ① 002_account_and_push.sql を適用済みであること
--   ② Edge Function を **--no-verify-jwt 付きで** デプロイ済みであること
--        supabase functions deploy collect-reminder --use-api --no-verify-jwt
--   ③ 関数側のシークレットを設定済みであること
--        supabase secrets set CRON_SECRET=<十分に長いランダム文字列>
--
-- ⚠️ **--no-verify-jwt は必須。** Edge Function は既定で Authorization ヘッダの
--    JWT を検証し、無い要求をゲートウェイの段階で 401 にする。下の net.http_post は
--    x-cron-secret しか送らないので、JWT 検証を有効にしたままだと**関数のコードに
--    一度も到達しない**。ログにも関数側の出力が出ないので原因が分かりにくい。
--
--    JWT 検証を切っても無防備にはならない。関数の冒頭が x-cron-secret を突き合わせ、
--    一致しなければ 403 を返す（index.ts の先頭を参照）。
--
-- ⚠️ **1 時間ごとに起動する。** 設計図 10.1 は「毎日 07:50 JST」と書いているが、
--    通知時刻は profiles.notification_prefs.reminderHour でユーザーごとに
--    変えられるので 1 日 1 回では守れない。関数側が「その時刻を選んでいる人」
--    だけに絞って送る。
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ---------------------------------------------------------------------
-- ① シークレットを Vault に入れる
--
-- ⚠️ cron.schedule の SQL 本文は cron.job テーブルに**平文で保存される**。
--    service_role キーを直接書くと、DB を読める人全員に漏れる。必ず Vault 経由で参照する。
--
-- 下の 2 行の値を実際のものに置き換えてから実行すること。
-- ---------------------------------------------------------------------
-- vault.create_secret(① 秘密の値, ② 参照名, ③ 説明文)
--   ① 実際に使われる値。ここを書き換える
--   ② cron の SQL が name で引くので、**この綴りは変えないこと**
--   ③ 人間向けのメモ。動作には影響しない

SELECT vault.create_secret(
  'https://<PROJECT_REF>.supabase.co/functions/v1/collect-reminder',  -- ← 置き換える
  'collect_reminder_url',
  'collect-reminder Edge Function の URL'
);

-- ⚠️ ①には supabase secrets set CRON_SECRET=... で設定したのと
--    **同じ文字列**を入れる。食い違うと cron が毎時 403 を受け取り続けるが、
--    画面のどこにも出ないので気づけない
SELECT vault.create_secret(
  '<ここに CRON_SECRET の値を貼る>',  -- ← 置き換える
  'collect_reminder_secret',
  'pg_cron が x-cron-secret ヘッダに載せる合言葉'
);

-- ---------------------------------------------------------------------
-- ② 毎時 0 分に起動
--
-- cron の時刻は **UTC**。毎時なので JST との差は関係ない
-- （関数側が JST の「今何時か」を計算して突き合わせる）。
-- ---------------------------------------------------------------------
SELECT cron.schedule(
  'collect-reminder-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
             WHERE name = 'collect_reminder_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets
                         WHERE name = 'collect_reminder_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- ---------------------------------------------------------------------
-- 確認用
-- ---------------------------------------------------------------------
-- -- 登録されているか
-- SELECT jobid, jobname, schedule, active FROM cron.job;
--
-- -- 直近の実行結果（status が 'succeeded' になること）
-- SELECT jobid, status, return_message, start_time
--   FROM cron.job_run_details
--  ORDER BY start_time DESC LIMIT 10;
--
-- -- HTTP の応答（Edge Function が返した JSON が body に入る）
-- SELECT id, status_code, content FROM net._http_response
--  ORDER BY created DESC LIMIT 10;
--
-- -- 止めるとき
-- SELECT cron.unschedule('collect-reminder-hourly');
