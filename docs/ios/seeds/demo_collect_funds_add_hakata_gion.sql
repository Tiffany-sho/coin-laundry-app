-- =====================================================================
-- デモ組織に **博多店・祇園店を追加する**集金データ（3 店舗版への上乗せ）
--
-- ⚠️ **これは「追加」で、既存の 3 店舗（浅草・難波・すすきの）には触らない。**
--    demo_collect_funds_3stores.sql を流したあとの組織に、2 店舗ぶんを足す。
--    ④ の削除は **博多・祇園に限定**してある（接頭辞だけで消すと 3 店舗ぶんも消える）。
--
--   npx supabase link --project-ref <ref>     -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/seeds/demo_collect_funds_add_hakata_gion.sql
--
-- ⚠️ **先に博多店・祇園店をアプリから作っておくこと。** この SQL は店舗を作らない。
--    理由は 2 つ:
--      1. SQL で作るとプランの店舗数上限を素通りする（アプリの判定を迂回する）
--      2. **設備（machines）が空だと合計入力モードで入り、機器別の内訳に出ない**
--    ⚠️ **設備も一緒に登録すること**（洗濯機・乾燥機など）。
--
-- ⚠️ **Free プランの上限は 3 店舗。** 5 店舗にすると「上限にかかっているのに
--    5 店舗ある」という辻褄の合わない状態になる。デモ組織を Pro 以上にしてから流すこと。
--
-- ⚠️ **demo_collect_funds_3stores.sql を流し直すと、この 2 店舗ぶんも消える**
--    （あちらの削除は組織の全店舗が対象）。流し直したらこれも流し直すこと。
--
-- 入るもの: 博多 57 件 / 祇園 38 件（2025-01 〜 2026-07 の 95 件）
--
-- ⚠️ **何度流しても同じ結果になる。** client_request_id を
--    'seed-demo-<店舗>-<epoch>' で決め打ちしている。**取り消したいときは:**
--
--      DELETE FROM public.collect_funds
--       WHERE client_request_id LIKE 'seed-demo-博多店-%'
--          OR client_request_id LIKE 'seed-demo-祇園店-%';
--
-- ⚠️ **店舗名は末尾の「店」が有っても無くても通る**（regexp_replace(store, '店$', '')）。
--    laundry_store.store に入っているのが「博多」でも「博多店」でも当たる。
--
-- ---------------------------------------------------------------------
-- 数字の作り方（5 店舗版からそのまま持ってきている）
--
--   月商 = 店舗の基準額 × 季節係数 × 前年比 × ゆらぎ（±3%）
--   基準額    博多 208,000 / 祇園 132,000（既存の すすきの 172,000 の上下に入る）
--   集金日    博多 = 月 9・19・28 日 / 祇園 = 月 15・28 日
--             ⚠️ **店舗ごとに回数が違う**のは意図的（実際の運用に幅がある）
--
-- ⚠️ **未来の日付は 1 件も入っていない**（2026-07 まで）。
-- ⚠️ **金額はすべて 100 円単位。** fundsArray[].funds は**枚数**なので、
--    100 で割り切れないと現金ぶんを機器へ配れない（docs/contracts.md の「単位」）。
-- =====================================================================

DO $$
DECLARE
  c_create_methods CONSTANT boolean := true;

  v_org         uuid;
  v_missing     text;
  v_collecters  uuid[];
  v_collecter   uuid;
  v_row         record;
  v_elem        record;
  v_weights     numeric[];
  v_wsum        numeric;
  v_machine     jsonb;
  v_funds       jsonb;
  v_cashless    jsonb;
  v_mid         uuid;
  v_cash        integer;
  v_coins       integer;
  v_alloc       integer;
  v_rest        integer;
  v_i           integer;
  v_n           integer;
  v_unknown     integer := 0;
  v_nomachine   integer := 0;
  v_deleted     integer := 0;
  v_inserted    integer := 0;
BEGIN
  -- -------------------------------------------------------------------
  -- ① 組織を「既存の 3 店舗」から特定する
  --
  -- ⚠️ **博多・祇園から探さない。** まだ作っていないと 0 件になり、
  --    「組織が見つかりません」としか言えず、何をすればよいか分からない。
  --    3 店舗が揃っている組織＝デモ組織、と決めてから 2 店舗の有無を見る。
  -- -------------------------------------------------------------------
  SELECT organization_id INTO v_org
    FROM public.laundry_store
   WHERE regexp_replace(store, '店$', '') IN ('浅草', '難波', 'すすきの')
   GROUP BY organization_id
  HAVING count(DISTINCT regexp_replace(store, '店$', '')) = 3
   LIMIT 1;

  IF v_org IS NULL THEN
    RAISE EXCEPTION '浅草・難波・すすきの が揃った組織が見つかりません。先に demo_collect_funds_3stores.sql の前提を満たしてください';
  END IF;

  -- ⚠️ **店舗はこの SQL では作らない**（上のヘッダの理由）。無ければ止める。
  SELECT string_agg(s.name, ' / ') INTO v_missing
    FROM (VALUES ('博多'), ('祇園')) AS s(name)
   WHERE NOT EXISTS (
     SELECT 1 FROM public.laundry_store ls
      WHERE ls.organization_id = v_org
        AND regexp_replace(ls.store, '店$', '') = s.name
   );
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION '次の店舗がありません: %。⚠️ アプリから作ってください（設備も一緒に登録すること。SQL で作るとプランの上限を素通りし、設備が空だと機器別内訳に出ません）', v_missing;
  END IF;

  -- -------------------------------------------------------------------
  -- ② 集金担当者を選ぶ（3 店舗版と同じ。⚠️ viewer を除く）
  -- -------------------------------------------------------------------
  SELECT array_agg(user_id ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, user_id)
    INTO v_collecters
    FROM public.organization_members
   WHERE org_id = v_org AND role <> 'viewer';

  IF v_collecters IS NULL THEN
    RAISE EXCEPTION '組織に admin / collecter が 1 人もいません';
  END IF;

  -- -------------------------------------------------------------------
  -- ③ 支払方法を用意する
  --
  -- ⚠️ **店舗ごとに違えてある**（009 で支払方法は店舗ごとになった）。
  --    全店舗を同じにすると、絞り込みの意味がデモから伝わらない。
  -- ⚠️ 既にある名前は触らない（ON CONFLICT DO NOTHING）。
  -- -------------------------------------------------------------------
  IF c_create_methods THEN
    INSERT INTO public.payment_methods (org_id, laundry_id, name, sort_order, is_active)
    SELECT v_org, ls.id, m.name, m.ord, true
      FROM (VALUES
        ('博多店', 'PayPay', 0),
        ('博多店', '交通系IC', 1),
        ('祇園店', 'PayPay', 0),
        ('祇園店', 'クレジットカード', 1)
      ) AS m(store, name, ord)
      JOIN public.laundry_store ls
        ON regexp_replace(ls.store, '店$', '') = regexp_replace(m.store, '店$', '')
       AND ls.organization_id = v_org
    ON CONFLICT (laundry_id, name) DO NOTHING;
  END IF;

  -- -------------------------------------------------------------------
  -- ④ 前回のぶんを消す
  --
  -- ⚠️ **博多・祇園に限る。** 3 店舗版は組織の全店舗を消すが、こちらが
  --    同じことをすると**浅草・難波・すすきのの 190 件が巻き添えで消える。**
  -- -------------------------------------------------------------------
  DELETE FROM public.collect_funds
   WHERE client_request_id LIKE 'seed-demo-%'
     AND "laundryId" IN (
       SELECT id FROM public.laundry_store
        WHERE organization_id = v_org
          AND regexp_replace(store, '店$', '') IN ('博多', '祇園')
     );
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- -------------------------------------------------------------------
  -- ⑤ 投入
  -- -------------------------------------------------------------------
  -- ⚠️ **cl を jsonb にキャストする。** VALUES の中の '...' は型が付かず text に
  --    なるので、jsonb_array_elements(text) が無いと言われて落ちる。
  FOR v_row IN
    -- ⚠️ **real_store は DB に実際に入っている綴り。** VALUES のキー（'博多店'）を
    --    laundryName に入れると、アプリが表示で「店」を足して**「博多店店」**になる。
    SELECT s.store, ls.store AS real_store,
           s.dt::bigint AS dt, s.cash::int AS cash, s.cl::jsonb AS cl,
           ls.id AS laundry_id, ls.machines
      FROM (VALUES
      ('博多店', 1736348400000, 61300, '[{"name":"PayPay","amount":14100},{"name":"交通系IC","amount":6700}]'),  -- 2025-01-09
      ('博多店', 1737212400000, 60800, '[{"name":"PayPay","amount":9800},{"name":"交通系IC","amount":4600}]'),  -- 2025-01-19
      ('博多店', 1737990000000, 66000, '[{"name":"PayPay","amount":12700},{"name":"交通系IC","amount":6000}]'),  -- 2025-01-28
      --   2025-02  月商 216,600円
      ('博多店', 1739026800000, 59400, '[{"name":"PayPay","amount":12000},{"name":"交通系IC","amount":5700}]'),  -- 2025-02-09
      ('博多店', 1739890800000, 52900, '[{"name":"PayPay","amount":8900},{"name":"交通系IC","amount":4200}]'),  -- 2025-02-19
      ('博多店', 1740668400000, 57000, '[{"name":"PayPay","amount":11200},{"name":"交通系IC","amount":5300}]'),  -- 2025-02-28
      --   2025-03  月商 179,500円
      ('博多店', 1741446000000, 44200, '[{"name":"PayPay","amount":8100},{"name":"交通系IC","amount":3800}]'),  -- 2025-03-09
      ('博多店', 1742310000000, 53300, '[{"name":"PayPay","amount":8100},{"name":"交通系IC","amount":3800}]'),  -- 2025-03-19
      ('博多店', 1743087600000, 44700, '[{"name":"PayPay","amount":9200},{"name":"交通系IC","amount":4300}]'),  -- 2025-03-28
      --   2025-04  月商 186,000円
      ('博多店', 1744124400000, 45800, '[{"name":"PayPay","amount":10100},{"name":"交通系IC","amount":4800}]'),  -- 2025-04-09
      ('博多店', 1744988400000, 47200, '[{"name":"PayPay","amount":11400},{"name":"交通系IC","amount":5300}]'),  -- 2025-04-19
      ('博多店', 1745766000000, 46500, '[{"name":"PayPay","amount":10100},{"name":"交通系IC","amount":4800}]'),  -- 2025-04-28
      --   2025-05  月商 204,400円
      ('博多店', 1746716400000, 54100, '[{"name":"PayPay","amount":11400},{"name":"交通系IC","amount":5300}]'),  -- 2025-05-09
      ('博多店', 1747580400000, 51600, '[{"name":"PayPay","amount":11200},{"name":"交通系IC","amount":5200}]'),  -- 2025-05-19
      ('博多店', 1748358000000, 52700, '[{"name":"PayPay","amount":8800},{"name":"交通系IC","amount":4100}]'),  -- 2025-05-28
      --   2025-06  月商 221,500円
      ('博多店', 1749394800000, 57500, '[{"name":"PayPay","amount":8500},{"name":"交通系IC","amount":4000}]'),  -- 2025-06-09
      ('博多店', 1750258800000, 54900, '[{"name":"PayPay","amount":13100},{"name":"交通系IC","amount":6200}]'),  -- 2025-06-19
      ('博多店', 1751036400000, 60100, '[{"name":"PayPay","amount":11700},{"name":"交通系IC","amount":5500}]'),  -- 2025-06-28
      --   2025-07  月商 246,900円
      ('博多店', 1751986800000, 64000, '[{"name":"PayPay","amount":10500},{"name":"交通系IC","amount":5000}]'),  -- 2025-07-09
      ('博多店', 1752850800000, 61300, '[{"name":"PayPay","amount":13100},{"name":"交通系IC","amount":6200}]'),  -- 2025-07-19
      ('博多店', 1753628400000, 66700, '[{"name":"PayPay","amount":13700},{"name":"交通系IC","amount":6400}]'),  -- 2025-07-28
      --   2025-08  月商 223,400円
      ('博多店', 1754665200000, 57600, '[{"name":"PayPay","amount":8600},{"name":"交通系IC","amount":4000}]'),  -- 2025-08-09
      ('博多店', 1755529200000, 56700, '[{"name":"PayPay","amount":11800},{"name":"交通系IC","amount":5500}]'),  -- 2025-08-19
      ('博多店', 1756306800000, 58800, '[{"name":"PayPay","amount":13900},{"name":"交通系IC","amount":6500}]'),  -- 2025-08-28
      --   2025-09  月商 167,800円
      ('博多店', 1757343600000, 49200, '[{"name":"PayPay","amount":8600},{"name":"交通系IC","amount":4100}]'),  -- 2025-09-09
      ('博多店', 1758207600000, 42000, '[{"name":"PayPay","amount":6900},{"name":"交通系IC","amount":3200}]'),  -- 2025-09-19
      ('博多店', 1758985200000, 41200, '[{"name":"PayPay","amount":8600},{"name":"交通系IC","amount":4000}]'),  -- 2025-09-28
      --   2025-10  月商 184,000円
      ('博多店', 1759935600000, 46100, '[{"name":"PayPay","amount":11100},{"name":"交通系IC","amount":5200}]'),  -- 2025-10-09
      ('博多店', 1760799600000, 44300, '[{"name":"PayPay","amount":9200},{"name":"交通系IC","amount":4400}]'),  -- 2025-10-19
      ('博多店', 1761577200000, 51600, '[{"name":"PayPay","amount":8200},{"name":"交通系IC","amount":3900}]'),  -- 2025-10-28
      --   2025-11  月商 202,100円
      ('博多店', 1762614000000, 44100, '[{"name":"PayPay","amount":10200},{"name":"交通系IC","amount":4800}]'),  -- 2025-11-09
      ('博多店', 1763478000000, 56600, '[{"name":"PayPay","amount":11800},{"name":"交通系IC","amount":5500}]'),  -- 2025-11-19
      ('博多店', 1764255600000, 52800, '[{"name":"PayPay","amount":11100},{"name":"交通系IC","amount":5200}]'),  -- 2025-11-28
      --   2025-12  月商 224,000円
      ('博多店', 1765206000000, 58100, '[{"name":"PayPay","amount":10500},{"name":"交通系IC","amount":5000}]'),  -- 2025-12-09
      ('博多店', 1766070000000, 56700, '[{"name":"PayPay","amount":12900},{"name":"交通系IC","amount":6000}]'),  -- 2025-12-19
      ('博多店', 1766847600000, 61400, '[{"name":"PayPay","amount":9100},{"name":"交通系IC","amount":4300}]'),  -- 2025-12-28
      --   2026-01  月商 254,100円
      ('博多店', 1767884400000, 72600, '[{"name":"PayPay","amount":10800},{"name":"交通系IC","amount":5100}]'),  -- 2026-01-09
      ('博多店', 1768748400000, 71000, '[{"name":"PayPay","amount":10900},{"name":"交通系IC","amount":5100}]'),  -- 2026-01-19
      ('博多店', 1769526000000, 59700, '[{"name":"PayPay","amount":12900},{"name":"交通系IC","amount":6000}]'),  -- 2026-01-28
      --   2026-02  月商 227,700円
      ('博多店', 1770562800000, 65800, '[{"name":"PayPay","amount":10900},{"name":"交通系IC","amount":5100}]'),  -- 2026-02-09
      ('博多店', 1771426800000, 58900, '[{"name":"PayPay","amount":11500},{"name":"交通系IC","amount":5400}]'),  -- 2026-02-19
      ('博多店', 1772204400000, 55800, '[{"name":"PayPay","amount":9700},{"name":"交通系IC","amount":4600}]'),  -- 2026-02-28
      --   2026-03  月商 184,500円
      ('博多店', 1772982000000, 45200, '[{"name":"PayPay","amount":9100},{"name":"交通系IC","amount":4300}]'),  -- 2026-03-09
      ('博多店', 1773846000000, 46600, '[{"name":"PayPay","amount":10700},{"name":"交通系IC","amount":5100}]'),  -- 2026-03-19
      ('博多店', 1774623600000, 49400, '[{"name":"PayPay","amount":9600},{"name":"交通系IC","amount":4500}]'),  -- 2026-03-28
      --   2026-04  月商 193,100円
      ('博多店', 1775660400000, 46500, '[{"name":"PayPay","amount":10700},{"name":"交通系IC","amount":5000}]'),  -- 2026-04-09
      ('博多店', 1776524400000, 50300, '[{"name":"PayPay","amount":9500},{"name":"交通系IC","amount":4400}]'),  -- 2026-04-19
      ('博多店', 1777302000000, 51900, '[{"name":"PayPay","amount":10100},{"name":"交通系IC","amount":4700}]'),  -- 2026-04-28
      --   2026-05  月商 209,700円
      ('博多店', 1778252400000, 52500, '[{"name":"PayPay","amount":12600},{"name":"交通系IC","amount":6000}]'),  -- 2026-05-09
      ('博多店', 1779116400000, 53400, '[{"name":"PayPay","amount":8600},{"name":"交通系IC","amount":4100}]'),  -- 2026-05-19
      ('博多店', 1779894000000, 59400, '[{"name":"PayPay","amount":8900},{"name":"交通系IC","amount":4200}]'),  -- 2026-05-28
      --   2026-06  月商 233,300円
      ('博多店', 1780930800000, 66900, '[{"name":"PayPay","amount":10300},{"name":"交通系IC","amount":4800}]'),  -- 2026-06-09
      ('博多店', 1781794800000, 62000, '[{"name":"PayPay","amount":10700},{"name":"交通系IC","amount":5000}]'),  -- 2026-06-19
      ('博多店', 1782572400000, 59800, '[{"name":"PayPay","amount":9400},{"name":"交通系IC","amount":4400}]'),  -- 2026-06-28
      --   2026-07  月商 269,600円
      ('博多店', 1783522800000, 72200, '[{"name":"PayPay","amount":10500},{"name":"交通系IC","amount":5000}]'),  -- 2026-07-09
      ('博多店', 1784386800000, 62900, '[{"name":"PayPay","amount":12800},{"name":"交通系IC","amount":6000}]'),  -- 2026-07-19
      ('博多店', 1785164400000, 76600, '[{"name":"PayPay","amount":16000},{"name":"交通系IC","amount":7600}]'),  -- 2026-07-28
      ('祇園店', 1736866800000, 57800, '[{"name":"PayPay","amount":10500},{"name":"クレジットカード","amount":7600}]'),  -- 2025-01-15
      ('祇園店', 1737990000000, 63300, '[{"name":"PayPay","amount":9800},{"name":"クレジットカード","amount":7100}]'),  -- 2025-01-28
      --   2025-02  月商 139,400円
      ('祇園店', 1739545200000, 49100, '[{"name":"PayPay","amount":9700},{"name":"クレジットカード","amount":7100}]'),  -- 2025-02-15
      ('祇園店', 1740668400000, 52800, '[{"name":"PayPay","amount":12000},{"name":"クレジットカード","amount":8700}]'),  -- 2025-02-28
      --   2025-03  月商 110,300円
      ('祇園店', 1741964400000, 41500, '[{"name":"PayPay","amount":5900},{"name":"クレジットカード","amount":4200}]'),  -- 2025-03-15
      ('祇園店', 1743087600000, 46900, '[{"name":"PayPay","amount":6800},{"name":"クレジットカード","amount":5000}]'),  -- 2025-03-28
      --   2025-04  月商 115,600円
      ('祇園店', 1744642800000, 46200, '[{"name":"PayPay","amount":8100},{"name":"クレジットカード","amount":5900}]'),  -- 2025-04-15
      ('祇園店', 1745766000000, 43100, '[{"name":"PayPay","amount":7100},{"name":"クレジットカード","amount":5200}]'),  -- 2025-04-28
      --   2025-05  月商 123,200円
      ('祇園店', 1747234800000, 46000, '[{"name":"PayPay","amount":8200},{"name":"クレジットカード","amount":5900}]'),  -- 2025-05-15
      ('祇園店', 1748358000000, 49400, '[{"name":"PayPay","amount":7900},{"name":"クレジットカード","amount":5800}]'),  -- 2025-05-28
      --   2025-06  月商 142,000円
      ('祇園店', 1749913200000, 47000, '[{"name":"PayPay","amount":10400},{"name":"クレジットカード","amount":7600}]'),  -- 2025-06-15
      ('祇園店', 1751036400000, 61300, '[{"name":"PayPay","amount":9100},{"name":"クレジットカード","amount":6600}]'),  -- 2025-06-28
      --   2025-07  月商 161,100円
      ('祇園店', 1752505200000, 67600, '[{"name":"PayPay","amount":11300},{"name":"クレジットカード","amount":8100}]'),  -- 2025-07-15
      ('祇園店', 1753628400000, 58300, '[{"name":"PayPay","amount":9200},{"name":"クレジットカード","amount":6600}]'),  -- 2025-07-28
      --   2025-08  月商 140,900円
      ('祇園店', 1755183600000, 52200, '[{"name":"PayPay","amount":10100},{"name":"クレジットカード","amount":7300}]'),  -- 2025-08-15
      ('祇園店', 1756306800000, 54000, '[{"name":"PayPay","amount":10000},{"name":"クレジットカード","amount":7300}]'),  -- 2025-08-28
      --   2025-09  月商 107,100円
      ('祇園店', 1757862000000, 38400, '[{"name":"PayPay","amount":7200},{"name":"クレジットカード","amount":5200}]'),  -- 2025-09-15
      ('祇園店', 1758985200000, 42100, '[{"name":"PayPay","amount":8200},{"name":"クレジットカード","amount":6000}]'),  -- 2025-09-28
      --   2025-10  月商 121,000円
      ('祇園店', 1760454000000, 47500, '[{"name":"PayPay","amount":7500},{"name":"クレジットカード","amount":5400}]'),  -- 2025-10-15
      ('祇園店', 1761577200000, 45100, '[{"name":"PayPay","amount":9000},{"name":"クレジットカード","amount":6500}]'),  -- 2025-10-28
      --   2025-11  月商 131,300円
      ('祇園店', 1763132400000, 49800, '[{"name":"PayPay","amount":10400},{"name":"クレジットカード","amount":7600}]'),  -- 2025-11-15
      ('祇園店', 1764255600000, 49000, '[{"name":"PayPay","amount":8400},{"name":"クレジットカード","amount":6100}]'),  -- 2025-11-28
      --   2025-12  月商 144,400円
      ('祇園店', 1765724400000, 56900, '[{"name":"PayPay","amount":9500},{"name":"クレジットカード","amount":6800}]'),  -- 2025-12-15
      ('祇園店', 1766847600000, 51900, '[{"name":"PayPay","amount":11200},{"name":"クレジットカード","amount":8100}]'),  -- 2025-12-28
      --   2026-01  月商 165,000円
      ('祇園店', 1768402800000, 70200, '[{"name":"PayPay","amount":12800},{"name":"クレジットカード","amount":9200}]'),  -- 2026-01-15
      ('祇園店', 1769526000000, 52300, '[{"name":"PayPay","amount":11900},{"name":"クレジットカード","amount":8600}]'),  -- 2026-01-28
      --   2026-02  月商 149,700円
      ('祇園店', 1771081200000, 57800, '[{"name":"PayPay","amount":10600},{"name":"クレジットカード","amount":7700}]'),  -- 2026-02-15
      ('祇園店', 1772204400000, 54000, '[{"name":"PayPay","amount":11400},{"name":"クレジットカード","amount":8200}]'),  -- 2026-02-28
      --   2026-03  月商 119,300円
      ('祇園店', 1773500400000, 44800, '[{"name":"PayPay","amount":8200},{"name":"クレジットカード","amount":6000}]'),  -- 2026-03-15
      ('祇園店', 1774623600000, 47300, '[{"name":"PayPay","amount":7500},{"name":"クレジットカード","amount":5500}]'),  -- 2026-03-28
      --   2026-04  月商 121,800円
      ('祇園店', 1776178800000, 45500, '[{"name":"PayPay","amount":9900},{"name":"クレジットカード","amount":7100}]'),  -- 2026-04-15
      ('祇園店', 1777302000000, 47600, '[{"name":"PayPay","amount":6800},{"name":"クレジットカード","amount":4900}]'),  -- 2026-04-28
      --   2026-05  月商 131,500円
      ('祇園店', 1778770800000, 49400, '[{"name":"PayPay","amount":9600},{"name":"クレジットカード","amount":6900}]'),  -- 2026-05-15
      ('祇園店', 1779894000000, 49800, '[{"name":"PayPay","amount":9200},{"name":"クレジットカード","amount":6600}]'),  -- 2026-05-28
      --   2026-06  月商 150,100円
      ('祇園店', 1781449200000, 53900, '[{"name":"PayPay","amount":11800},{"name":"クレジットカード","amount":8500}]'),  -- 2026-06-15
      ('祇園店', 1782572400000, 59600, '[{"name":"PayPay","amount":9500},{"name":"クレジットカード","amount":6800}]'),  -- 2026-06-28
      --   2026-07  月商 162,600円
      ('祇園店', 1784041200000, 64800, '[{"name":"PayPay","amount":9600},{"name":"クレジットカード","amount":6900}]'),  -- 2026-07-15
      ('祇園店', 1785164400000, 59300, '[{"name":"PayPay","amount":12800},{"name":"クレジットカード","amount":9200}]')   -- 2026-07-28
      ) AS s(store, dt, cash, cl)
      JOIN public.laundry_store ls
        ON regexp_replace(ls.store, '店$', '') = regexp_replace(s.store, '店$', '')
       AND ls.organization_id = v_org
     ORDER BY s.dt, s.store
  LOOP
    ----------------------------------------------------------------
    -- 支払方法を名前 → id に引き直す
    --
    -- ⚠️ **先にこちらをやる。** 登録の無い方法は現金へ寄せるので、
    --    機器へ配る現金額がここで変わる。順番を入れ替えると
    --    「機器の和 + 支払方法 = 総額」が崩れる。
    -- ⚠️ **name も焼き込む**（fundsArray と同じ）。
    ----------------------------------------------------------------
    v_cashless := '[]'::jsonb;
    v_cash := v_row.cash;

    FOR v_elem IN SELECT value AS item FROM jsonb_array_elements(v_row.cl) LOOP
      SELECT id INTO v_mid
        FROM public.payment_methods
       WHERE laundry_id = v_row.laundry_id AND name = v_elem.item->>'name';

      IF v_mid IS NULL THEN
        v_cash := v_cash + (v_elem.item->>'amount')::int;
        v_unknown := v_unknown + 1;
      ELSE
        v_cashless := v_cashless || jsonb_build_object(
          'methodId', v_mid,
          'name',     v_elem.item->>'name',
          'amount',   (v_elem.item->>'amount')::int
        );
      END IF;
    END LOOP;

    ----------------------------------------------------------------
    -- 現金ぶんを機器へ配る
    --
    -- ⚠️ **funds は「枚数」。** 円のまま入れると集計が 100 倍になる。
    -- ⚠️ **端数は最後の機器が吸う。** 捨てると「機器の和 × 100 ≠ 現金ぶん」になり、
    --    機器別内訳に注記が出る。
    ----------------------------------------------------------------
    v_coins := v_cash / 100;
    v_funds := '[]'::jsonb;
    v_n := jsonb_array_length(COALESCE(v_row.machines, '[]'::jsonb));

    IF v_n = 0 THEN
      -- 設備が未登録の店舗。合計入力モードとして入る（fundsArray は空配列）
      v_nomachine := v_nomachine + 1;
    ELSE
      SELECT array_agg(
               CASE WHEN jsonb_typeof(m.value->'num') = 'number'
                    THEN GREATEST((m.value->>'num')::numeric, 1) ELSE 1 END
               * (85 + abs(hashtext(COALESCE(m.value->>'id', m.ord::text) || v_row.dt::text) % 31))
               ORDER BY m.ord)
        INTO v_weights
        FROM jsonb_array_elements(v_row.machines) WITH ORDINALITY AS m(value, ord);

      SELECT sum(w) INTO v_wsum FROM unnest(v_weights) AS w;
      v_rest := v_coins;

      FOR v_i IN 1..v_n LOOP
        IF v_i = v_n THEN
          v_alloc := v_rest;
        ELSE
          v_alloc := floor(v_coins * v_weights[v_i] / v_wsum)::int;
          v_rest := v_rest - v_alloc;
        END IF;

        v_machine := v_row.machines->(v_i - 1);
        v_funds := v_funds || jsonb_build_object(
          'id',    v_machine->>'id',
          'name',  v_machine->>'name',
          'funds', v_alloc
        );
      END LOOP;
    END IF;

    ----------------------------------------------------------------
    -- ⚠️ **totalFunds は総額**（現金 + キャッシュレス）。BFF の createData と
    --    同じ規約。現金ぶんだけ入れると月別売上がキャッシュレスのぶん減る。
    ----------------------------------------------------------------
    v_collecter := v_collecters[
      1 + abs(hashtext(v_row.store || v_row.dt::text) % array_length(v_collecters, 1))
    ];

    INSERT INTO public.collect_funds
      ("laundryId", "laundryName", "date", "fundsArray", "totalFunds", cashless, collecter, client_request_id)
    VALUES (
      v_row.laundry_id,
      v_row.real_store,   -- ⚠️ VALUES のキーではなく DB の綴り
      v_row.dt,
      v_funds,
      v_cash + COALESCE((SELECT sum((c->>'amount')::int) FROM jsonb_array_elements(v_cashless) AS c), 0),
      v_cashless,
      v_collecter,
      'seed-demo-' || v_row.store || '-' || v_row.dt::text
    );
    v_inserted := v_inserted + 1;
  END LOOP;

  RAISE NOTICE '組織 % / 担当者 % 名 / 削除 % 件 / 投入 % 件（博多・祇園のみ）',
    v_org, array_length(v_collecters, 1), v_deleted, v_inserted;
  IF v_unknown > 0 THEN
    RAISE NOTICE '⚠️ 未登録の支払方法が % 件あり、現金に寄せました（総額は変わりません）', v_unknown;
  END IF;
  IF v_nomachine > 0 THEN
    RAISE NOTICE '⚠️ 設備が未登録のぶん % 件は合計入力モードで入りました（機器別内訳に出ません）。アプリで設備を登録してから流し直してください', v_nomachine;
  END IF;
END $$;

-- =====================================================================
-- 確認用
--
-- 1) 5 店舗が揃ったか（月商に季節性が出ているか）
--      SELECT ls.store,
--             to_char(to_timestamp((cf.date + 32400000) / 1000) AT TIME ZONE 'UTC', 'YYYY-MM') AS ym,
--             count(*) AS 回数, sum(cf."totalFunds") AS 月商
--        FROM public.collect_funds cf
--        JOIN public.laundry_store ls ON ls.id = cf."laundryId"
--       WHERE cf.client_request_id LIKE 'seed-demo-%'
--       GROUP BY 1, 2 ORDER BY 1, 2;
--
-- 2) ⚠️ **既存の 3 店舗が消えていないこと**（190 + 95 = 285 件）
--      SELECT count(*) FROM public.collect_funds WHERE client_request_id LIKE 'seed-demo-%';
--
-- 3) ⚠️ **不変条件**: 機器の和 × 100 + キャッシュレス = totalFunds
--      SELECT count(*) FROM public.collect_funds cf
--       WHERE cf.client_request_id LIKE 'seed-demo-%'
--         AND cf."totalFunds" <> (
--               COALESCE((SELECT sum((f->>'funds')::int) FROM jsonb_array_elements(cf."fundsArray") f), 0) * 100
--             + COALESCE((SELECT sum((c->>'amount')::int) FROM jsonb_array_elements(cf.cashless) c), 0));
--    → 0（1 件でも出たら機器別内訳の合計が総額と食い違う）
--
-- 4) ⚠️ **fundsArray が空の行が無いこと**（設備を登録し忘れていないか）
--      SELECT DISTINCT "laundryName" FROM public.collect_funds
--       WHERE client_request_id LIKE 'seed-demo-%' AND "fundsArray" = '[]'::jsonb;
--    → 0 件
--
-- 5) ⚠️ **laundryName に「店」が入っていないこと**（画面が「博多店店」になる）
--      SELECT DISTINCT "laundryName" FROM public.collect_funds
--       WHERE client_request_id LIKE 'seed-demo-%';
--    → laundry_store.store と 1 文字も違わないこと
--
-- 6) 未来の行が無いこと
--      SELECT count(*) FROM public.collect_funds
--       WHERE client_request_id LIKE 'seed-demo-%'
--         AND date > (extract(epoch FROM now()) * 1000);   -- → 0
--
-- 取り消し（この 2 店舗ぶんだけ）
--      DELETE FROM public.collect_funds
--       WHERE client_request_id LIKE 'seed-demo-博多店-%'
--          OR client_request_id LIKE 'seed-demo-祇園店-%';
--    ⚠️ 支払方法（payment_methods）は消えない。手で消すこと
-- =====================================================================
