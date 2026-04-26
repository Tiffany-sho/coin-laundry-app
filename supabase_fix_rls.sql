-- ============================================================
-- RLS 循環参照の修正スクリプト
-- Supabase の SQL Editor で実行してください
-- ============================================================

-- ① organization_members の SELECT ポリシーを循環しないシンプルな形に変更
DROP POLICY IF EXISTS "members can view org members" ON public.organization_members;

CREATE POLICY "users can view own membership" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

-- ② オーナーがメンバー一覧を取得するための SECURITY DEFINER 関数
--    （RLS をバイパスして全メンバーを返す）
CREATE OR REPLACE FUNCTION public.get_org_members()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  org_id uuid,
  role text,
  joined_at timestamptz,
  username text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    om.id,
    om.user_id,
    om.org_id,
    om.role,
    om.joined_at,
    p.username,
    p.full_name
  FROM public.organization_members om
  LEFT JOIN public.profiles p ON p.id = om.user_id
  WHERE om.org_id = (
    SELECT org_id FROM public.organization_members
    WHERE user_id = auth.uid()
    LIMIT 1
  );
$$;

-- ============================================================
-- 完了。コードは変更済みなので、そのままデプロイできます。
-- ============================================================
