-- ============================================================
-- Collecie: 役割・権限管理 マイグレーションスクリプト
-- Supabase の SQL Editor で実行してください
-- 既存データは保持されます
-- ============================================================

-- ============================================================
-- Phase 1: 新テーブルの作成
-- ============================================================

-- 1. organizations テーブル（事業者）
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'マイ組織',
  owner_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

-- 2. organization_members テーブル（メンバー一覧）
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer', -- 'owner' | 'collecter' | 'viewer'
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_org_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT organization_members_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT organization_members_unique UNIQUE (org_id, user_id)
);

-- 3. organization_invitations テーブル（招待）
CREATE TABLE public.organization_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'collecter',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  invited_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  CONSTRAINT organization_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT organization_invitations_org_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT organization_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.profiles(id),
  CONSTRAINT organization_invitations_token_unique UNIQUE (token)
);

-- ============================================================
-- Phase 2: 既存テーブルへのカラム追加
-- ============================================================

ALTER TABLE public.laundry_store ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- ============================================================
-- Phase 3: 既存データの移行（データは消えません）
-- ============================================================

-- 3-1. laundry_store を持つオーナーに組織を作成
DO $$
DECLARE
  owner_record RECORD;
  new_org_id uuid;
BEGIN
  FOR owner_record IN
    SELECT DISTINCT owner FROM public.laundry_store
  LOOP
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('マイ組織', owner_record.owner)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (org_id, user_id, role)
    VALUES (new_org_id, owner_record.owner, 'owner');

    UPDATE public.laundry_store
    SET organization_id = new_org_id
    WHERE owner = owner_record.owner;
  END LOOP;
END $$;

-- 3-2. 店舗を持たないが owner ロールのユーザーにも組織を作成
DO $$
DECLARE
  owner_record RECORD;
  new_org_id uuid;
BEGIN
  FOR owner_record IN
    SELECT p.id FROM public.profiles p
    WHERE p.role = 'owner'
    AND p.id NOT IN (SELECT DISTINCT owner FROM public.laundry_store)
    AND p.id NOT IN (SELECT user_id FROM public.organization_members)
  LOOP
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('マイ組織', owner_record.id)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (org_id, user_id, role)
    VALUES (new_org_id, owner_record.id, 'owner');
  END LOOP;
END $$;

-- 3-3. organization_id を NOT NULL に変更（移行後）
ALTER TABLE public.laundry_store ALTER COLUMN organization_id SET NOT NULL;

-- ============================================================
-- Phase 4: RLS の設定
-- ============================================================

-- 新テーブルの RLS を有効化
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- organizations: メンバーは閲覧可、オーナーは更新可
CREATE POLICY "members can view org" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "owner can update org" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "owner can insert org" ON public.organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- organization_members: メンバー全員が閲覧可
CREATE POLICY "members can view org members" ON public.organization_members
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.organization_members m2 WHERE m2.user_id = auth.uid())
  );

CREATE POLICY "owners can add members" ON public.organization_members
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "owners can remove members" ON public.organization_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "owners can update member roles" ON public.organization_members
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- organization_invitations: オーナーが管理
CREATE POLICY "owners can view invitations" ON public.organization_invitations
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "owners can create invitations" ON public.organization_invitations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "owners can delete invitations" ON public.organization_invitations
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- laundry_store: 既存の RLS をすべて削除して org ベースに更新
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'laundry_store' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.laundry_store', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "org members can view stores" ON public.laundry_store
  FOR SELECT USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org owners can create stores" ON public.laundry_store
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "org owners can update stores" ON public.laundry_store
  FOR UPDATE USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "org owners can delete stores" ON public.laundry_store
  FOR DELETE USING (
    organization_id IN (
      SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- collect_funds: 既存 RLS を削除して org ベースに更新
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'collect_funds' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.collect_funds', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "org members can view collect_funds" ON public.collect_funds
  FOR SELECT USING (
    "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "org collectors can insert collect_funds" ON public.collect_funds
  FOR INSERT WITH CHECK (
    "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'collecter')
      )
    )
  );

CREATE POLICY "collectors can update own records" ON public.collect_funds
  FOR UPDATE USING (
    collecter = auth.uid()
    OR "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
      )
    )
  );

CREATE POLICY "collectors can delete own records" ON public.collect_funds
  FOR DELETE USING (
    collecter = auth.uid()
    OR "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'owner'
      )
    )
  );

-- laundry_state: 既存 RLS を削除して org ベースに更新
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'laundry_state' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.laundry_state', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "org members can view laundry_state" ON public.laundry_state
  FOR SELECT USING (
    "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "org members can update laundry_state" ON public.laundry_state
  FOR UPDATE USING (
    "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "org owners can insert laundry_state" ON public.laundry_state
  FOR INSERT WITH CHECK (
    "laundryId" IN (
      SELECT id FROM public.laundry_store
      WHERE organization_id IN (
        SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- 完了
-- ============================================================
-- 上記が全て成功したら、コードの変更を deploy してください。
