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
-- ①' 置き換え忘れを検出する
--
-- ⚠️ **この番人が無いと置き換え忘れに気づけない。** vault.create_secret は値を
--    検証しないので、'<PROJECT_REF>' のまま入れても成功する。pg_net は
--    ホスト名として不正な URL を名前解決できずに黙って捨て、応答行も残らない。
--    cron 側は毎時 succeeded を返し続けるため、通知だけが永久に届かなくなる。
--    実際にこれで 2 日気づかなかった。
-- ---------------------------------------------------------------------
DO $check$
DECLARE
  v_url    text;
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_url
    FROM vault.decrypted_secrets WHERE name = 'collect_reminder_url';
  SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets WHERE name = 'collect_reminder_secret';

  IF v_url IS NULL OR v_secret IS NULL THEN
    RAISE EXCEPTION 'Vault に値が入っていない（url=%, secret=%）',
      v_url IS NOT NULL, v_secret IS NOT NULL;
  END IF;

  -- 山括弧が残っている ＝ 置き換えていない
  IF v_url LIKE '%<%' OR v_secret LIKE '%<%' THEN
    RAISE EXCEPTION
      'プレースホルダが残っている。上の 2 つの create_secret の値を実際のものに置き換えてから実行すること';
  END IF;

  IF v_url NOT LIKE 'https://%.supabase.co/functions/v1/collect-reminder' THEN
    RAISE EXCEPTION 'URL の形が違う: %', v_url;
  END IF;
END
$check$;

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

-- =====================================================================
-- 確認用
--
-- ⚠️ **cron.job_run_details だけ見ても何も分からない。** net.http_post は要求を
--    キューに積んで即座に返るので、Edge Function が 403 でも 404 でも、URL が
--    不正でも status は 'succeeded' になる。**結果は net._http_response にしか出ない。**
-- =====================================================================

-- -- ① 拡張・ジョブ・Vault をまとめて（1 文なので SQL Editor で全行見える）
-- SELECT '1_拡張' AS step, extname AS name, extversion AS detail
--   FROM pg_extension WHERE extname IN ('pg_cron','pg_net')
-- UNION ALL
-- SELECT '1_ジョブ', jobname, schedule || ' / active=' || active::text FROM cron.job
-- UNION ALL
-- SELECT '2_Vault', name,
--        'rows=' || count(*)::text || ' len=' || max(length(decrypted_secret))::text
--   FROM vault.decrypted_secrets
--  WHERE name IN ('collect_reminder_url','collect_reminder_secret')
--  GROUP BY name ORDER BY 1, 2;
--
--    期待値: 拡張 2 行 / ジョブ 1 行（'0 * * * * / active=true'）/ Vault 2 行で rows=1。
--    ⚠️ rows=2 は 004 の二重実行。単一行サブクエリが毎時失敗するので古い方を消す:
--       SELECT id, name, created_at FROM vault.secrets
--        WHERE name LIKE 'collect_reminder%' ORDER BY created_at;
--       SELECT vault.delete_secret('<古い方の id>');
--    ⚠️ url の len は 70 が正しい。63 なら <PROJECT_REF> が残っている

-- -- ② :00 を待たずに手で撃つ（cron の本文と同一。これが一番速い切り分け）
-- SELECT net.http_post(
--   url := (SELECT decrypted_secret FROM vault.decrypted_secrets
--            WHERE name = 'collect_reminder_url'),
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets
--                        WHERE name = 'collect_reminder_secret')
--   ),
--   body := '{}'::jsonb,
--   timeout_milliseconds := 30000
-- );

-- -- ③ 数秒待って応答を見る。error_msg も必ず選ぶこと
-- SELECT id, status_code, content, error_msg, created
--   FROM net._http_response ORDER BY id DESC LIMIT 5;
--
--    200 + {"sent":0,"reason":"no_target_org"} … 正常（集金日が前日・当日でないだけ）
--    403                                        … Vault と CRON_SECRET が食い違い
--    401                                        … --no-verify-jwt 無しでデプロイした
--    404                                        … project ref か関数名が違う
--    status_code が NULL + error_msg あり       … pg_net が外に出られていない
--    行が増えない                               … ワーカー停止。SELECT net.worker_restart();
--
--    ⚠️ 行は数時間で消える。撃った直後に見ること
--    ⚠️ ?dryRun=1 は日付判定を飛ばして daysUntil を 0 に上書きするので、
--       空撃ちと手撃ちで reason が変わるのは正常

-- -- ④ 自動起動が走ったか（次の :00 以降）
-- SELECT d.status, d.return_message, d.start_time
--   FROM cron.job_run_details d JOIN cron.job j USING (jobid)
--  WHERE j.jobname = 'collect-reminder-hourly'
--  ORDER BY d.start_time DESC LIMIT 5;
--    そのうえで ③ をもう一度撃ち、**id が増えていること**を確認する

-- -- 止めるとき
-- SELECT cron.unschedule('collect-reminder-hourly');
