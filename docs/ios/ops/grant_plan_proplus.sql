-- =====================================================================
-- 制作者の組織に Pro+ を恒久的に付与する（支払いなし）
--
--   npx supabase link --project-ref <ref>     -- ⚠️ .temp があっても毎回要る
--   npx supabase db query --linked -f docs/ios/ops/grant_plan_proplus.sql
--
-- ⚠️ **マイグレーションではない。** スキーマは一切変えず、1 組織の
--    `organizations.plan` を書き換えるだけ。010 まで適用済みであることが前提
--    （'proplus' は 010 の CHECK 制約で追加された値）。
--
-- ⚠️ **何度流しても同じ結果になる。** 冒頭の v_email の組織を名指しで更新する。
--
-- ---------------------------------------------------------------------
-- なぜ `plan` 列を直接書くだけで足りるのか
--
-- プランの制限を判定しているのは Server Action で、見ているのは
-- `organizations.plan` **1 列だけ**（`src/functions/plans.js` の
-- `PLAN_LIMITS` / `PLAN_MEMBER_LIMITS` / `planAtLeast`）。
-- 支払いの有無を確かめる処理はどこにも無い。したがって
--
--   plan = 'proplus'  →  店舗 10 件 / メンバー無制限 / 書き出し可
--
-- が、Stripe も Apple も通さずにそのまま効く。
--
-- ---------------------------------------------------------------------
-- ⚠️ 書き換えたあと、黙って `free` に戻る経路が 3 つある
--
-- `organizations.plan` に書く箇所は全部で 3 つあり、**どれも「今の値」を
-- 見ずに上書きする。** 恒久化と言っても列を固定する仕掛けは無いので、
-- 下のどれかが起きたら戻る。**戻ったらこのファイルを流し直せばよい。**
--
--   ① アプリ内課金の検証（`billing/appleAction.js` の `applyAppleTransaction`）
--      … アプリのプラン画面で購入・復元を押したとき。⚠️ **押さないこと。**
--        Apple の取引が正になるので、Pro+ のままでも「復元」だけで上書きされる
--
--   ② App Store Server Notification（同 `applyAppleNotification`）
--      … Apple から更新・解約・返金が届いたとき。組織は
--        `apple_original_transaction_id`、無ければ `appAccountToken`（= 組織 ID）
--        で引かれる。⚠️ **後者があるので、下で apple_* を消しても防げない。**
--        ⚠️ TestFlight で買ったぶんは Sandbox 購読で、最大 6 回更新すると
--           自動失効する（2026-08 のぶんは終わっている）。**新しく買わない限り
--           届かない**ので、実際にはここが動く見込みは無い
--
--   ③ Stripe の webhook（`api/stripe/webhook/route.js`）
--      … Web のプラン画面で「アップグレード」を押して決済したとき。
--        ⚠️ **Max のカードには押せるボタンが出る。** 押さないこと
--        （Pro+ のカードは `stripe_customer_id` が NULL なので
--        「現在利用中」の無効ボタンになる）
--
-- ---------------------------------------------------------------------
-- ⚠️ `plan_source` は NULL にする（'apple' / 'stripe' と書かない）
--
-- 003 がこの列を「NULL = 有料契約なし」と定義しており、**実際に誰も
-- 支払っていないので NULL が正。** 嘘を書くと、それを信じた出し分けが
-- 噛み合わなくなる:
--
--   'stripe' … アプリのプラン画面が「この端末からは変更できません」になる
--              （`app/settings/plan.tsx` の `lockedByOtherSource`）
--   'apple'  … `apple_expires_at` を見て解約の案内を出す側に回る。
--              期限が過去のまま Pro+ と並ぶので読む人が混乱する
--
-- ⚠️ **引き換えに、アプリのプラン画面には購入導線が出たままになる**
--    （上の ① を自分で踏めてしまう）。塞ぎたいなら列ではなくコードで
--    分岐させること。**データで嘘をつくより安全。**
-- =====================================================================

DO $$
DECLARE
  -- ⚠️ ここだけ書き換える。制作者本人のログインメール
  v_email text := 'mituya1884tansan@gmail.com';
  v_plan  text := 'proplus';

  v_user     uuid;
  v_org      uuid;
  v_org_name text;
  v_role     text;
  v_before   text;
  v_stripe   text;
  v_apple    text;
  v_members  int;
  v_stores   int;
BEGIN
  -- ① ユーザーを引く
  SELECT id INTO v_user
  FROM auth.users
  WHERE lower(email) = lower(v_email);

  IF v_user IS NULL THEN
    RAISE EXCEPTION '該当するユーザーがいません: % （auth.users のメールを確認すること）', v_email;
  END IF;

  -- ② 所属組織を引く
  -- ⚠️ organization_members は 1 人 1 組織。2 行あるならデータが壊れている
  SELECT count(*) INTO v_members
  FROM public.organization_members
  WHERE user_id = v_user;

  IF v_members = 0 THEN
    RAISE EXCEPTION '% は組織に所属していません。先にアプリで組織を作ること', v_email;
  END IF;

  IF v_members > 1 THEN
    RAISE EXCEPTION '% が % 件の組織に所属している。1 人 1 組織の前提が崩れているので手で確かめること', v_email, v_members;
  END IF;

  SELECT m.org_id, m.role INTO v_org, v_role
  FROM public.organization_members m
  WHERE m.user_id = v_user;

  -- ③ 更新前の状態を読む
  SELECT o.name, o.plan, o.stripe_subscription_id, o.apple_original_transaction_id
    INTO v_org_name, v_before, v_stripe, v_apple
  FROM public.organizations o
  WHERE o.id = v_org;

  /*
    ⚠️ **本物の有料契約が生きている組織では止める。**
       Stripe の購読が生きているのに plan を書き換えると、次の webhook で
       上書きされるうえ、請求だけが残る。先に Stripe 側で解約すること。
  */
  IF v_stripe IS NOT NULL THEN
    RAISE EXCEPTION 'この組織には Stripe の購読 (%) が生きている。先に解約してから流すこと', v_stripe;
  END IF;

  -- ④ 付与する
  UPDATE public.organizations
  SET plan = v_plan,
      /*
        ⚠️ 支払いが無いので NULL が正（003 の定義）。理由は冒頭の注記
      */
      plan_source = NULL,
      /*
        ⚠️ **表示に出る 2 列は消す。** 残すと Pro+ と並んで
           「有効期限 2026/08/…（過去）」「無料期間 …」が出続ける
           （`CurrentPlanCard` が `appleExpiresAt` / `trialEndsAt` を描く）
      */
      apple_expires_at = NULL,
      trial_ends_at = NULL
      /*
        ⚠️ `apple_original_transaction_id` / `apple_product_id` /
           `apple_environment` は **消さない。** 過去の取引を追うための履歴で、
           003 も失効時に残す設計にしてある。消しても ② は
           `appAccountToken` 経由で組織を引けるので、防波堤にはならない
      */
  WHERE id = v_org;

  SELECT count(*) INTO v_stores
  FROM public.laundry_store
  WHERE organization_id = v_org;

  RAISE NOTICE '─────────────────────────────────────────';
  RAISE NOTICE ' 組織       : % (%)', v_org_name, v_org;
  RAISE NOTICE ' 権限       : %', v_role;
  RAISE NOTICE ' プラン     : %  →  %', coalesce(v_before, 'free'), v_plan;
  RAISE NOTICE ' 店舗数     : % 件（Pro+ の上限は 10）', v_stores;
  RAISE NOTICE ' Apple 取引 : %', coalesce(v_apple, '(なし)');
  RAISE NOTICE '─────────────────────────────────────────';

  IF v_role <> 'admin' THEN
    RAISE NOTICE '⚠️ 権限が admin ではないので、プラン画面と店舗の追加が出ません';
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 確認クエリ（上とは別に流す）
--
-- ⚠️ **ここが期待どおりでもアプリの表示は変わらないことがある。**
--    react-query の永続キャッシュ（MMKV）が最大 7 日ぶん前の応答を
--    返すので、アプリを一度開き直すか画面を引き下げて取り直すこと。
-- ---------------------------------------------------------------------
SELECT
  o.name                            AS "組織",
  o.plan                            AS "プラン",
  o.plan_source                     AS "契約の出どころ",     -- NULL が正
  o.trial_ends_at                   AS "無料期間",           -- NULL が正
  o.apple_expires_at                AS "Apple期限",          -- NULL が正
  o.apple_original_transaction_id   AS "Apple取引",          -- 履歴なので残っていてよい
  o.stripe_subscription_id          AS "Stripe購読",         -- NULL が正
  (SELECT count(*) FROM public.laundry_store s WHERE s.organization_id = o.id)      AS "店舗数",
  (SELECT count(*) FROM public.organization_members m WHERE m.org_id = o.id)       AS "メンバー数"
FROM public.organizations o
JOIN public.organization_members m ON m.org_id = o.id
JOIN auth.users u ON u.id = m.user_id
WHERE lower(u.email) = lower('mituya1884tansan@gmail.com');

-- ---------------------------------------------------------------------
-- 取り消したいとき（free に戻す）
--
-- ⚠️ **店舗が 4 件以上あると上限（free = 3）を超えた状態になる。**
--    不具合ではなく、プランを下げたときに既存を外さない仕様
--    （`docs/contracts.md` の「プランの制限」）。アプリは
--    `PlanLimitNotice` で理由を出す。
-- ---------------------------------------------------------------------
-- UPDATE public.organizations o
-- SET plan = 'free', plan_source = NULL
-- WHERE o.id = (
--   SELECT m.org_id FROM public.organization_members m
--   JOIN auth.users u ON u.id = m.user_id
--   WHERE lower(u.email) = lower('mituya1884tansan@gmail.com')
-- );
