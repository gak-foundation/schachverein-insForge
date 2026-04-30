-- Enable Row Level Security on club_addons
ALTER TABLE public.club_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for club_addons

-- SELECT: Super admins, club admins, and club members can view addons
-- Members need to see them to know which features are active
DROP POLICY IF EXISTS club_addons_select ON public.club_addons;
CREATE POLICY club_addons_select ON public.club_addons
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

-- WRITE: Only super admins and club admins can manage addons
DROP POLICY IF EXISTS club_addons_write ON public.club_addons;
CREATE POLICY club_addons_write ON public.club_addons
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );
