-- =====================================================================
-- デモ組織に **博多店・祇園店の経費を追加する**（3 店舗版への上乗せ）
--
-- ⚠️ **これは「追加」で、既存の 3 店舗（浅草・難波・すすきの）には触らない。**
--    ② の削除は **博多・祇園に限定**してある。印（[seed-demo]）だけで消すと、
--    3 店舗ぶんの 80 件と**組織全体の固定費**（通信費・会計ソフト）まで巻き添えになる。
--
--   npx supabase link --project-ref <ref>     -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/seeds/demo_expenses_add_hakata_gion.sql
--
-- ⚠️ **マイグレーションではない。** スキーマは一切変えない。008 まで適用済みで、
--    `demo_expenses_3stores.sql` と `demo_collect_funds_add_hakata_gion.sql` を
--    先に流してあることが前提。
--
-- ⚠️ **組織全体の固定費（laundry_id が NULL）は作らない。** 3 店舗版が既に
--    入れている（通信費・会計ソフト）。ここで足すと**二重計上**になる。
--
-- ⚠️ **demo_expenses_3stores.sql を流し直すと、この 2 店舗ぶんも消える**
--    （あちらの削除は組織全体が対象）。流し直したらこれも流し直すこと。
--
-- 入るもの:
--   単発（expenses）           … 2025-01 〜 2026-07 の 2 店舗ぶん 53 件
--                                （仕入れ 38 / 修繕費 9 / 消耗品費 6）
--   毎月の固定費（recurring）  … 4 件（店舗ごとの家賃・水道光熱費）
--
-- ⚠️ **取り消したいときは（この 2 店舗ぶんだけ）:**
--
--      DELETE FROM public.expenses e
--       USING public.laundry_store ls
--       WHERE ls.id = e.laundry_id
--         AND e.note LIKE '%[seed-demo]%'
--         AND regexp_replace(ls.store, '店$', '') IN ('博多', '祇園');
--      DELETE FROM public.recurring_expenses r
--       USING public.laundry_store ls
--       WHERE ls.id = r.laundry_id
--         AND r.name LIKE '%[seed-demo]%'
--         AND regexp_replace(ls.store, '店$', '') IN ('博多', '祇園');
--
-- ---------------------------------------------------------------------
-- 数字の作り方（3 店舗版と同じ式）
--
--   売上に対して**利益が残る**ように置いている（赤字のデモは不安を与える）。
--   固定費（家賃 + 水道光熱費）は店舗の月商のおよそ 27%、
--   単発（仕入れ・修繕）を足して 35〜40% に収まる。
--   基準額    博多 208,000 / 祇園 132,000（集金のシードと同じ値）
--
-- ⚠️ **`amount` は「円」。** 集金の `fundsArray[].funds` は**硬貨の枚数**
--    （金額は ×100）。同じデータベースに単位の違う金額があるので取り違えない。
-- ⚠️ **`date` は JST 深夜 0 時の epoch（ミリ秒）。** `collect_funds.date` と同じ規約。
--    SQL で組み立てるので **UTC の 15:00 前日**に当たる値になる。
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
  v_missing text;
BEGIN
  -- -------------------------------------------------------------------
  -- ① 組織を「既存の 3 店舗」から特定する
  --
  -- ⚠️ **博多・祇園から探さない。** まだ作っていないと 0 件になり、
  --    「組織が見つかりません」としか言えず、何をすればよいか分からない。
  -- -------------------------------------------------------------------
  SELECT organization_id INTO v_org_id
    FROM public.laundry_store
   WHERE regexp_replace(store, '店$', '') IN ('浅草', '難波', 'すすきの')
   GROUP BY organization_id
  HAVING count(DISTINCT regexp_replace(store, '店$', '')) = 3
   LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION '浅草・難波・すすきの が揃った組織が見つかりません。先に demo_expenses_3stores.sql の前提を満たしてください';
  END IF;

  -- ⚠️ **店舗はこの SQL では作らない。** 無ければ止める。
  SELECT string_agg(s.name, ' / ') INTO v_missing
    FROM (VALUES ('博多'), ('祇園')) AS s(name)
   WHERE NOT EXISTS (
     SELECT 1 FROM public.laundry_store ls
      WHERE ls.organization_id = v_org_id
        AND regexp_replace(ls.store, '店$', '') = s.name
   );
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION '次の店舗がありません: %。⚠️ アプリから作ってください', v_missing;
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
  --
  -- ⚠️ **博多・祇園に限る。** 印だけで消すと 3 店舗ぶんの 80 件が巻き添えになる。
  -- ⚠️ **`laundry_id IN (...)` は NULL を含まない。** これで組織全体の固定費
  --    （通信費・会計ソフト）が守られる。**`OR laundry_id IS NULL` を足さないこと。**
  -- -------------------------------------------------------------------
  DELETE FROM public.expenses
   WHERE org_id = v_org_id
     AND note LIKE '%[seed-demo]%'
     AND laundry_id IN (
       SELECT id FROM public.laundry_store
        WHERE organization_id = v_org_id
          AND regexp_replace(store, '店$', '') IN ('博多', '祇園')
     );

  DELETE FROM public.recurring_expenses
   WHERE org_id = v_org_id
     AND name LIKE '%[seed-demo]%'
     AND laundry_id IN (
       SELECT id FROM public.laundry_store
        WHERE organization_id = v_org_id
          AND regexp_replace(store, '店$', '') IN ('博多', '祇園')
     );

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
           regexp_replace(store, '店$', '') AS short,
           CASE regexp_replace(store, '店$', '')
             WHEN '博多' THEN 208000
             WHEN '祇園' THEN 132000
           END AS base
      FROM public.laundry_store
     WHERE organization_id = v_org_id
       AND regexp_replace(store, '店$', '') IN ('博多', '祇園')
     ORDER BY store
  LOOP
    -- 家賃 … 月商のおよそ 18%。⚠️ 千円単位に丸めておく（実在感のため）
    -- ⚠️ **`short`（「店」を外した綴り）に「店」を足す。** 生の `store` を使うと、
    --    「店」付きで作られた組織で **「博多店店 家賃」** になる。
    INSERT INTO public.recurring_expenses
      (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
    VALUES
      (v_org_id, v_store.id, v_store.short || '店 家賃 [seed-demo]',
       round(v_store.base * 0.18 / 1000) * 1000, '家賃', 27, '2025-01', NULL);

    -- 水道光熱費 … 月商のおよそ 9%
    INSERT INTO public.recurring_expenses
      (org_id, laundry_id, name, amount, category, day_of_month, start_month, end_month)
    VALUES
      (v_org_id, v_store.id, v_store.short || '店 水道光熱費 [seed-demo]',
       round(v_store.base * 0.09 / 1000) * 1000, '水道光熱費', 15, '2025-01', NULL);
  END LOOP;

  -- ⚠️ **組織全体の固定費はここで作らない**（3 店舗版が入れている。二重になる）。

  -- -------------------------------------------------------------------
  -- ④ 単発の経費
  --
  -- ⚠️ 決め打ちの擬似乱数（v_seq から作る）にしてある。random() を使うと
  --    流すたびに数字が変わり、スクリーンショットと食い違う。
  -- ⚠️ **`ORDER BY store` が要る。** v_seq は店舗をまたいで通し番号になるので、
  --    店舗を取る順番が変わると金額と修繕の周期がまるごとずれる。
  --    PostgreSQL は ORDER BY の無い SELECT の順序を保証しない。
  -- ⚠️ **v_seq は 0 から数え直す**（3 店舗版の続きにはしない）。あちらを流し直しても
  --    こちらの金額が変わらないようにするため。
  -- -------------------------------------------------------------------
  v_seq := 0;
  FOR v_store IN
    SELECT id, store,
           regexp_replace(store, '店$', '') AS short,
           CASE regexp_replace(store, '店$', '')
             WHEN '博多' THEN 208000
             WHEN '祇園' THEN 132000
           END AS base
      FROM public.laundry_store
     WHERE organization_id = v_org_id
       AND regexp_replace(store, '店$', '') IN ('博多', '祇園')
     ORDER BY store
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

  RAISE NOTICE '組織 % に博多・祇園の経費を投入しました', v_org_id;
END $$;

-- =====================================================================
-- 確認用
--
-- 1) 件数（⚠️ 3 店舗ぶんが残っていること）
--      SELECT count(*) FROM public.expenses WHERE note LIKE '%[seed-demo]%';
--        → 133（3 店舗の 80 + 博多・祇園の 53）
--      SELECT count(*) FROM public.recurring_expenses WHERE name LIKE '%[seed-demo]%';
--        → 13（3 店舗の 9 + 博多・祇園の 4）
--
-- 2) ⚠️ **組織全体の固定費が 3 件のまま**であること（二重に入れていないか）
--      SELECT name, amount, start_month, end_month
--        FROM public.recurring_expenses
--       WHERE name LIKE '%[seed-demo]%' AND laundry_id IS NULL;
--        → 通信費 1 件 + 会計ソフト 2 件。**それ以上あれば二重計上**
--
-- 3) ⚠️ **固定費の名前に「店店」が無いこと**
--      SELECT name FROM public.recurring_expenses
--       WHERE name LIKE '%[seed-demo]%' AND name LIKE '%店店%';   -- → 0 件
--
-- 4) 店舗ごとの内訳（5 店舗とも入っているか）
--      SELECT ls.store, e.category, count(*), sum(e.amount)
--        FROM public.expenses e
--        JOIN public.laundry_store ls ON ls.id = e.laundry_id
--       WHERE e.note LIKE '%[seed-demo]%'
--       GROUP BY 1, 2 ORDER BY 1, 2;
--
-- 5) ⚠️ **未来の日付が無いこと**（集金のシードと揃える）
--      SELECT count(*) FROM public.expenses
--       WHERE note LIKE '%[seed-demo]%'
--         AND date > extract(epoch from now()) * 1000;   -- → 0
--
-- 6) ⚠️ **月別利益が赤字になっていないこと**（デモで赤字は不安を与える）
--    アプリの 収益 → 月別利益 で 0 の線より下へ伸びる月が無いか見る。
--    出るなら固定費の比率（0.18 / 0.09）を下げること。
-- =====================================================================
