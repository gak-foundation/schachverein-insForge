-- Security Hardening Migration
-- Moves RLS helper functions to a private schema to prevent RPC exposure
-- Fixes linter errors: anon_security_definer_function_executable, authenticated_security_definer_function_executable, function_search_path_mutable

-- 1. Create a private schema for auth helpers
CREATE SCHEMA IF NOT EXISTS auth_helpers;

-- 2. Revoke public access to the new schema
REVOKE ALL ON SCHEMA auth_helpers FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_helpers TO authenticated, anon;

-- 3. Define helper functions in auth_helpers schema
-- These are SECURITY DEFINER to bypass RLS when checking permissions

-- Returns the current authenticated user ID as text
CREATE OR REPLACE FUNCTION auth_helpers.get_auth_uid_text()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text $$;

-- Returns the member_id linked to the current authenticated user
CREATE OR REPLACE FUNCTION auth_helpers.get_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT member_id FROM public.auth_user WHERE id = auth_helpers.get_auth_uid_text();
$$;

-- Checks if the current user is a super admin
CREATE OR REPLACE FUNCTION auth_helpers.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_user
    WHERE id = auth_helpers.get_auth_uid_text() AND is_super_admin = true
  );
$$;

-- Checks if the current user is an active member of the given club
CREATE OR REPLACE FUNCTION auth_helpers.is_club_member(p_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    JOIN public.auth_user au ON au.member_id = cm.member_id
    WHERE cm.club_id = p_club_id
    AND au.id = auth_helpers.get_auth_uid_text()
    AND cm.status = 'active'
  );
$$;

-- Checks if the current user is an admin (admin or vorstand) of the given club
CREATE OR REPLACE FUNCTION auth_helpers.is_club_admin(p_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    JOIN public.auth_user au ON au.member_id = cm.member_id
    WHERE cm.club_id = p_club_id
    AND au.id = auth_helpers.get_auth_uid_text()
    AND cm.status = 'active'
    AND cm.role IN ('admin', 'vorstand')
  );
$$;

-- Checks if the current user shares any club with the given member
CREATE OR REPLACE FUNCTION auth_helpers.shares_club_with(p_member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships my_cm
    JOIN public.club_memberships target_cm ON my_cm.club_id = target_cm.club_id
    JOIN public.auth_user au ON au.member_id = my_cm.member_id
    WHERE target_cm.member_id = p_member_id
    AND au.id = auth_helpers.get_auth_uid_text()
    AND my_cm.status = 'active'
  );
$$;

-- Checks if the current user is admin of any club the given member belongs to
CREATE OR REPLACE FUNCTION auth_helpers.is_club_admin_for_member(p_member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    WHERE cm.member_id = p_member_id
    AND auth_helpers.is_club_admin(cm.club_id)
  );
$$;

-- Checks if the current user is admin of any club
CREATE OR REPLACE FUNCTION auth_helpers.is_any_club_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    JOIN public.auth_user au ON au.member_id = cm.member_id
    WHERE au.id = auth_helpers.get_auth_uid_text()
    AND cm.status = 'active'
    AND cm.role IN ('admin', 'vorstand')
  );
$$;

-- 4. Grant execute on the new functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth_helpers TO authenticated, anon;

-- 5. Drop old functions from public
DROP FUNCTION IF EXISTS public.get_auth_uid_text() CASCADE;
DROP FUNCTION IF EXISTS public.get_member_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_club_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_club_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.shares_club_with(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_club_admin_for_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_any_club_admin() CASCADE;

-- 6. Fix trigger functions in public
-- SET search_path fixes "function_search_path_mutable"
-- REVOKE EXECUTE fixes "anon_security_definer_function_executable"

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_catalog;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

ALTER FUNCTION public.handle_auth_user_sync() SET search_path = public, pg_catalog;
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM PUBLIC;

-- Handle rls_auto_enable if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable') THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_catalog;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;';
    END IF;
END $$;

-- 7. Recreate all RLS policies using the new auth_helpers schema
-- (Note: Dropping the functions with CASCADE already dropped the policies)

-- auth_user
CREATE POLICY auth_user_select ON public.auth_user
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_auth_uid_text()
  );

CREATE POLICY auth_user_update ON public.auth_user
  FOR UPDATE USING (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_auth_uid_text()
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_auth_uid_text()
  );

-- clubs
CREATE POLICY clubs_select ON public.clubs
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(id)
  );

CREATE POLICY clubs_write ON public.clubs
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(id)
  );

-- members
CREATE POLICY members_select ON public.members
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_member_id()
    OR auth_helpers.shares_club_with(id)
  );

CREATE POLICY members_insert ON public.members
  FOR INSERT WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_any_club_admin()
  );

CREATE POLICY members_update ON public.members
  FOR UPDATE USING (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_member_id()
    OR auth_helpers.is_club_admin_for_member(id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR id = auth_helpers.get_member_id()
    OR auth_helpers.is_club_admin_for_member(id)
  );

CREATE POLICY members_delete ON public.members
  FOR DELETE USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin_for_member(id)
  );

-- club_memberships
CREATE POLICY club_memberships_select ON public.club_memberships
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY club_memberships_write ON public.club_memberships
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- club_invitations
CREATE POLICY club_invitations_all ON public.club_invitations
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- availability
CREATE POLICY availability_select ON public.availability
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.shares_club_with(member_id)
  );

CREATE POLICY availability_write ON public.availability
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.is_club_admin_for_member(member_id)
  );

-- board_orders
CREATE POLICY board_orders_select ON public.board_orders
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND auth_helpers.is_club_member(t.club_id)
    )
  );

CREATE POLICY board_orders_write ON public.board_orders
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND auth_helpers.is_club_admin(t.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND auth_helpers.is_club_admin(t.club_id)
    )
  );

-- contribution_rates
CREATE POLICY contribution_rates_select ON public.contribution_rates
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY contribution_rates_write ON public.contribution_rates
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- documents
CREATE POLICY documents_select ON public.documents
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY documents_write ON public.documents
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- dwz_history
CREATE POLICY dwz_history_select ON public.dwz_history
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.shares_club_with(member_id)
  );

CREATE POLICY dwz_history_write ON public.dwz_history
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin_for_member(member_id)
  );

-- events
CREATE POLICY events_select ON public.events
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY events_write ON public.events
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- games
CREATE POLICY games_select ON public.games
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY games_write ON public.games
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- match_results
CREATE POLICY match_results_select ON public.match_results
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND auth_helpers.is_club_member(s.club_id)
    )
  );

CREATE POLICY match_results_write ON public.match_results
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND auth_helpers.is_club_admin(s.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND auth_helpers.is_club_admin(s.club_id)
    )
  );

-- matches
CREATE POLICY matches_select ON public.matches
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND auth_helpers.is_club_member(s.club_id)
    )
  );

CREATE POLICY matches_write ON public.matches
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND auth_helpers.is_club_admin(s.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND auth_helpers.is_club_admin(s.club_id)
    )
  );

-- media_assets
CREATE POLICY media_assets_select ON public.media_assets
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY media_assets_write ON public.media_assets
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- media_consents
CREATE POLICY media_consents_select ON public.media_consents
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND auth_helpers.is_club_member(ma.club_id)
    )
  );

CREATE POLICY media_consents_write ON public.media_consents
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND auth_helpers.is_club_admin(ma.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND auth_helpers.is_club_admin(ma.club_id)
    )
  );

-- meeting_protocols
CREATE POLICY meeting_protocols_select ON public.meeting_protocols
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY meeting_protocols_write ON public.meeting_protocols
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- member_status_history
CREATE POLICY member_status_history_select ON public.member_status_history
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.shares_club_with(member_id)
  );

CREATE POLICY member_status_history_write ON public.member_status_history
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin_for_member(member_id)
  );

-- newsletters
CREATE POLICY newsletters_select ON public.newsletters
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY newsletters_write ON public.newsletters
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- page_blocks
CREATE POLICY page_blocks_select ON public.page_blocks
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND auth_helpers.is_club_member(p.club_id)
    )
  );

CREATE POLICY page_blocks_write ON public.page_blocks
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND auth_helpers.is_club_admin(p.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND auth_helpers.is_club_admin(p.club_id)
    )
  );

-- page_revisions
CREATE POLICY page_revisions_select ON public.page_revisions
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND auth_helpers.is_club_member(p.club_id)
    )
  );

CREATE POLICY page_revisions_write ON public.page_revisions
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND auth_helpers.is_club_admin(p.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND auth_helpers.is_club_admin(p.club_id)
    )
  );

-- pages
CREATE POLICY pages_select ON public.pages
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY pages_write ON public.pages
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- payments
CREATE POLICY payments_select ON public.payments
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR member_id = auth_helpers.get_member_id()
    OR auth_helpers.is_club_admin(club_id)
  );

CREATE POLICY payments_write ON public.payments
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- seasons
CREATE POLICY seasons_select ON public.seasons
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY seasons_write ON public.seasons
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- sepa_exports
CREATE POLICY sepa_exports_all ON public.sepa_exports
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- team_memberships
CREATE POLICY team_memberships_select ON public.team_memberships
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND auth_helpers.is_club_member(t.club_id)
    )
  );

CREATE POLICY team_memberships_write ON public.team_memberships
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND auth_helpers.is_club_admin(t.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND auth_helpers.is_club_admin(t.club_id)
    )
  );

-- teams
CREATE POLICY teams_select ON public.teams
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY teams_write ON public.teams
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- tournament_participants
CREATE POLICY tournament_participants_select ON public.tournament_participants
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND auth_helpers.is_club_member(tr.club_id)
    )
  );

CREATE POLICY tournament_participants_write ON public.tournament_participants
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND auth_helpers.is_club_admin(tr.club_id)
    )
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND auth_helpers.is_club_admin(tr.club_id)
    )
  );

-- tournaments
CREATE POLICY tournaments_select ON public.tournaments
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY tournaments_write ON public.tournaments
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );

-- waitlist_applications
CREATE POLICY waitlist_applications_all ON public.waitlist_applications
  FOR ALL USING (
    auth_helpers.is_super_admin()
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
  );

-- audit_log
CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR (club_id IS NOT NULL AND auth_helpers.is_club_admin(club_id))
  );

CREATE POLICY audit_log_write ON public.audit_log
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR (club_id IS NOT NULL AND auth_helpers.is_club_admin(club_id))
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR (club_id IS NOT NULL AND auth_helpers.is_club_admin(club_id))
  );

-- club_addons (from 20260427100000_enable_rls_club_addons.sql)
CREATE POLICY club_addons_select ON public.club_addons
  FOR SELECT USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_member(club_id)
  );

CREATE POLICY club_addons_write ON public.club_addons
  FOR ALL USING (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  )
  WITH CHECK (
    auth_helpers.is_super_admin()
    OR auth_helpers.is_club_admin(club_id)
  );
