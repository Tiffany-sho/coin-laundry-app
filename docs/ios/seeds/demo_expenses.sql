-- =====================================================================
-- デモ組織の経費（App Store 審査用のサンプル）
--
--   npx supabase link --project-ref <ref>     -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/seeds/demo_expenses.sql
--
-- ⚠️ **マイグレーションではない。** スキーマは一切変えない。008 まで適用済みで、
--    `demo_collect_funds.sql` を先に流してあることが前提（同じ 5 店舗を使う）。
--
-- ⚠️ **経費の画面が空のまま審査に出さない。** 審査員が開いても何も出ず、
--    機能が動いていないのか中身が無いのか区別が付かない（お知らせと同じ理由）。
--
-- 入るもの:
--   単発（expenses）           … 2025-01 〜 2026-07 の 5 店舗ぶん
--   毎月の固定費（recurring）  … 店舗ごとの家賃・水道光熱費 + 組織全体の通信費
--
-- ⚠️ **何度流しても同じ結果になる。** note / name に 'seed-demo' の印を入れて
--    あり、投入の前に同じ印の行を消してから入れ直す。**取り消したいときは:**
--
--      DELETE FROM public.expenses           WHERE note LIKE '%[seed-demo]%';
--      DELETE FROM public.recurring_expenses WHERE name LIKE '%[seed-demo]%';
--
-- ⚠️ **本番の実データが入っている組織で流さないこと。** 店舗名で組織を特定する。
--
-- ---------------------------------------------------------------------
-- 数字の作り方
--
--   売上に対して**利益が残る**ように置いている（赤字のデモは不安を与える）。
--   固定費（家賃 + 水道光熱費）は店舗の月商のおよそ 25〜30%、
--   単発（仕入れ・修繕）を足して 35〜40% に収まる。
--
-- ⚠️ **`amount` は「円」。** 集金の `fundsArray[].funds` は**硬貨の枚数**
--    （金額は ×100）。同じデータベースに単位の違う金額があるので取り違えない。
-- ⚠️ **`date` は JST 深夜 0 時の epoch（ミリ秒）。** `collect_funds.date` と同じ規約。
--    ⚠️ SQL で組み立てるので、**UTC の 15:00 前日** に当たる値になる
--    （`extract(epoch from (d::timestamp - interval '9 hours')) * 1000`）。
-- ⚠️ **未来の日付を入れない。** 2026-07 までにしてある（集金のシードと揃える）。
-- =====================================================================

DO $$
DECLARE
  v_org_id  uuid;
  v_user_id uuid;
  v_store   record;
  v_month   date;
  v_amount  int;
  v_seq     int;
BEGIN
  -- -------------------------------------------------------------------
  -- ① 店舗名から組織を特定する
  --
  -- ⚠️ **組織 id を手で書かない。** 書き間違えると気づかないまま
  --    他人の組織へ入る。5 店舗が揃っている組織だけを対象にする。
  -- -------------------------------------------------------------------
  SELECT organization_id INTO v_org_id
    FROM public.laundry_store
   WHERE store IN ('浅草', '難波', '博多', 'すすきの', '祇園')
   GROUP BY organization_id
  HAVING count(DISTINCT store) = 5
   LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION '5 店舗（浅草・難波・博多・すすきの・祇園）が揃った組織が見つかりません。先に demo_collect_funds.sql の前提を満たしてください';
  END IF;

  -- 記録者。⚠️ admin を使う（誰が入れたか分からない行にしない）
  SELECT user_id INTO v_user_id
    FROM public.organization_members
   WHERE org_id = v_org_id AND role = 'admin'
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '組織 % に管理者が見つかりません', v_org_id;
  END IF;

  -- -------------------------------------------------------------------
  -- ② 前回のぶんを消す（何度流しても同じ結果にする）
  -- -------------------------------------------------------------------
  DELETE FROM public.expenses
   WHERE org_id = v_org_id AND note LIKE '%[seed-demo]%';
  DELETE FROM public.recurring_expenses
   WHERE org_id = v_org_id AND name LIKE '%[seed-demo]%';

  -- -------------------------------------------------------------------
  -- ③ 毎月の固定費（定義だけ。実体の行は作らない）
  --
  -- ⚠️ **`recurring_expenses` は読むときに展開される。** ここで行を作ると
  --    二重計上になる（008 の設計）。
  -- ⚠️ **`day_of_month` は 1〜28。** 29〜31 は存在しない月があり、その月だけ
  --    計上が飛ぶ（DB の CHECK でも弾かれる）。
  -- -------------------------------------------------------------------
  FOR v_store IN
    SELECT id, store,
           CASE store
             WHEN '浅草'     THEN 320000
             WHEN '難波'     THEN 262000
             WHEN '博多'     THEN 208000
             WHEN 'すすきの' THEN 172000
             WHEN '祇園'     THEN 132000
           END AS base
      FROM public.laundry_store
     WHERE organization_id = v_org_id
       AND store IN ('浅草', '難波', '博多', 'すすきの', '祇園')
  LOOP
    -- 家賃 … 月商のおよそ 18%。⚠️ 千円単位に丸めておく（実在感のため）
    INSERT INTO public.recurring_expenses
      (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
    VALUES
      (v_org_id, v_store.id, v_store.store || '店 家賃 [seed-demo]',
       round(v_store.base * 0.18 / 1000) * 1000, '家賃', 27, '2025-01', NULL);

    -- 水道光熱費 … 月商のおよそ 9%
    INSERT INTO public.recurring_expenses
      (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
    VALUES
      (v_org_id, v_store.id, v_store.store || '店 水道光熱費 [seed-demo]',
       round(v_store.base * 0.09 / 1000) * 1000, '水道光熱費', 15, '2025-01', NULL);
  END LOOP;

  -- 組織全体の固定費。⚠️ laundry_id を NULL にする（店舗に紐づかない支出）
  INSERT INTO public.recurring_expenses
    (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
  VALUES
    (v_org_id, NULL, '通信費（回線・SIM） [seed-demo]', 8800, '通信費', 20, '2025-01', NULL);

  /*
    ⚠️ **「途中で金額が変わった」例を 1 つ入れてある。**
       毎月の固定費は**金額を変えると過去の月まで遡って変わる**ので、
       正しい直し方は「古い定義を end_month で終わらせ、新しい定義を作る」。
       デモにこの形が無いと、審査員にも利用者にも運用が伝わらない。
  */
  INSERT INTO public.recurring_expenses
    (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
  VALUES
    (v_org_id, NULL, '会計ソフト利用料 [seed-demo]', 2200, '支払手数料', 10, '2025-01', '2025-12'),
    (v_org_id, NULL, '会計ソフト利用料 [seed-demo]', 2970, '支払手数料', 10, '2026-01', NULL);

  -- -------------------------------------------------------------------
  -- ④ 単発の経費
  --
  -- 洗剤・柔軟剤の仕入れ（毎月）と、修繕（ときどき）。
  -- ⚠️ 決め打ちの擬似乱数（月と店舗から作る）にしてある。random() を使うと
  --    流すたびに数字が変わり、スクリーンショットと食い違う。
  -- -------------------------------------------------------------------
  v_seq := 0;
  FOR v_store IN
    SELECT id, store,
           CASE store
             WHEN '浅草'     THEN 320000
             WHEN '難波'     THEN 262000
             WHEN '博多'     THEN 208000
             WHEN 'すすきの' THEN 172000
             WHEN '祇園'     THEN 132000
           END AS base
      FROM public.laundry_store
     WHERE organization_id = v_org_id
       AND store IN ('浅草', '難波', '博多', 'すすきの', '祇園')
  LOOP
    FOR v_month IN
      SELECT generate_series('2025-01-01'::date, '2026-07-01'::date, '1 month')::date
    LOOP
      v_seq := v_seq + 1;

      -- 仕入れ … 月商の 6〜8%。⚠️ 百円単位に丸める
      v_amount := round(v_store.base * (0.06 + ((v_seq * 37) % 20) / 1000.0) / 100) * 100;
      INSERT INTO public.expenses (org_id, laundry_id, date, amount, category, note, created_by)
      VALUES (
        v_org_id, v_store.id,
        extract(epoch from ((v_month + 4)::timestamp - interval '9 hours')) * 1000,
        v_amount, '仕入れ', '洗剤・柔軟剤の仕入れ [seed-demo]', v_user_id
      );

      -- 修繕 … 4 か月に 1 回くらい
      IF (v_seq % 4) = 0 THEN
        v_amount := 12000 + ((v_seq * 911) % 28) * 1000;
        INSERT INTO public.expenses (org_id, laundry_id, date, amount, category, note, created_by)
        VALUES (
          v_org_id, v_store.id,
          extract(epoch from ((v_month + 17)::timestamp - interval '9 hours')) * 1000,
          v_amount, '修繕費', '乾燥機の部品交換 [seed-demo]', v_user_id
        );
      END IF;

      -- 消耗品 … 半年に 1 回くらい
      IF (v_seq % 6) = 0 THEN
        INSERT INTO public.expenses (org_id, laundry_id, date, amount, category, note, created_by)
        VALUES (
          v_org_id, v_store.id,
          extract(epoch from ((v_month + 9)::timestamp - interval '9 hours')) * 1000,
          3300 + ((v_seq * 53) % 12) * 100, '消耗品費', '清掃用品の補充 [seed-demo]', v_user_id
        );
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '組織 % に経費を投入しました', v_org_id;
END $$;

-- =====================================================================
-- 確認用
--
-- 1) 件数（⚠️ 0 件なら店舗名の特定に失敗している）
--      SELECT count(*) FROM public.expenses WHERE note LIKE '%[seed-demo]%';
--      SELECT count(*) FROM public.recurring_expenses WHERE name LIKE '%[seed-demo]%';
--
-- 2) ⚠️ **未来の日付が無いこと**（集金のシードと揃える）
--      SELECT count(*) FROM public.expenses
--       WHERE note LIKE '%[seed-demo]%'
--         AND date > extract(epoch from now()) * 1000;   -- → 0
--
-- 3) ⚠️ **日付が JST 深夜 0 時になっていること**（epoch を JST で読むと 00:00）
--      SELECT to_char(to_timestamp(date / 1000) AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD HH24:MI')
--        FROM public.expenses WHERE note LIKE '%[seed-demo]%' LIMIT 5;
--
-- 4) 売上に対して利益が残っているか（月ごとにざっと見る）
--      SELECT to_char(to_timestamp(date / 1000) AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM') AS m,
--             sum(amount) AS expense
--        FROM public.expenses WHERE note LIKE '%[seed-demo]%'
--       GROUP BY 1 ORDER BY 1;
--    ⚠️ **固定費はここに出ない**（読むときに展開する設計のため）。
--       アプリ・Web の経費画面で合計を確認すること。
-- =====================================================================
