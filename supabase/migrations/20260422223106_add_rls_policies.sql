-- RLS Policies for all public tables
-- Fixes: rls_enabled_no_policy linter errors

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Returns the current authenticated user ID as text (matches auth_user.id varchar)
CREATE OR REPLACE FUNCTION public.get_auth_uid_text()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text $$;

-- Returns the member_id linked to the current authenticated user
CREATE OR REPLACE FUNCTION public.get_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT member_id FROM public.auth_user WHERE id = public.get_auth_uid_text();
$$;

-- Checks if the current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_user
    WHERE id = public.get_auth_uid_text() AND is_super_admin = true
  );
$$;

-- Checks if the current user is an active member of the given club
CREATE OR REPLACE FUNCTION public.is_club_member(p_club_id uuid)
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
    AND au.id = public.get_auth_uid_text()
    AND cm.status = 'active'
  );
$$;

-- Checks if the current user is an admin (admin or vorstand) of the given club
CREATE OR REPLACE FUNCTION public.is_club_admin(p_club_id uuid)
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
    AND au.id = public.get_auth_uid_text()
    AND cm.status = 'active'
    AND cm.role IN ('admin', 'vorstand')
  );
$$;

-- Checks if the current user shares any club with the given member
CREATE OR REPLACE FUNCTION public.shares_club_with(p_member_id uuid)
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
    AND au.id = public.get_auth_uid_text()
    AND my_cm.status = 'active'
  );
$$;

-- Checks if the current user is admin of any club the given member belongs to
CREATE OR REPLACE FUNCTION public.is_club_admin_for_member(p_member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    WHERE cm.member_id = p_member_id
    AND public.is_club_admin(cm.club_id)
  );
$$;

-- Checks if the current user is admin of any club
CREATE OR REPLACE FUNCTION public.is_any_club_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships cm
    JOIN public.auth_user au ON au.member_id = cm.member_id
    WHERE au.id = public.get_auth_uid_text()
    AND cm.status = 'active'
    AND cm.role IN ('admin', 'vorstand')
  );
$$;


-- ============================================================================
-- auth_user (self-access + super admin)
-- ============================================================================

DROP POLICY IF EXISTS auth_user_select ON public.auth_user;
CREATE POLICY auth_user_select ON public.auth_user
  FOR SELECT USING (
    public.is_super_admin()
    OR id = public.get_auth_uid_text()
  );

DROP POLICY IF EXISTS auth_user_update ON public.auth_user;
CREATE POLICY auth_user_update ON public.auth_user
  FOR UPDATE USING (
    public.is_super_admin()
    OR id = public.get_auth_uid_text()
  )
  WITH CHECK (
    public.is_super_admin()
    OR id = public.get_auth_uid_text()
  );


-- ============================================================================
-- clubs (members can read, admins can write)
-- ============================================================================

DROP POLICY IF EXISTS clubs_select ON public.clubs;
CREATE POLICY clubs_select ON public.clubs
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(id)
  );

DROP POLICY IF EXISTS clubs_write ON public.clubs;
CREATE POLICY clubs_write ON public.clubs
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(id)
  );


-- ============================================================================
-- members (complex: own record, shared club, admin)
-- ============================================================================

DROP POLICY IF EXISTS members_select ON public.members;
CREATE POLICY members_select ON public.members
  FOR SELECT USING (
    public.is_super_admin()
    OR id = public.get_member_id()
    OR public.shares_club_with(id)
  );

DROP POLICY IF EXISTS members_insert ON public.members;
CREATE POLICY members_insert ON public.members
  FOR INSERT WITH CHECK (
    public.is_super_admin()
    OR public.is_any_club_admin()
  );

DROP POLICY IF EXISTS members_update ON public.members;
CREATE POLICY members_update ON public.members
  FOR UPDATE USING (
    public.is_super_admin()
    OR id = public.get_member_id()
    OR public.is_club_admin_for_member(id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR id = public.get_member_id()
    OR public.is_club_admin_for_member(id)
  );

DROP POLICY IF EXISTS members_delete ON public.members;
CREATE POLICY members_delete ON public.members
  FOR DELETE USING (
    public.is_super_admin()
    OR public.is_club_admin_for_member(id)
  );


-- ============================================================================
-- club_memberships (members can read, admins can write)
-- ============================================================================

DROP POLICY IF EXISTS club_memberships_select ON public.club_memberships;
CREATE POLICY club_memberships_select ON public.club_memberships
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS club_memberships_write ON public.club_memberships;
CREATE POLICY club_memberships_write ON public.club_memberships
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- club_invitations (admin only)
-- ============================================================================

DROP POLICY IF EXISTS club_invitations_all ON public.club_invitations;
CREATE POLICY club_invitations_all ON public.club_invitations
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- availability (self + club members read, self + admin write)
-- ============================================================================

DROP POLICY IF EXISTS availability_select ON public.availability;
CREATE POLICY availability_select ON public.availability
  FOR SELECT USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.shares_club_with(member_id)
  );

DROP POLICY IF EXISTS availability_write ON public.availability;
CREATE POLICY availability_write ON public.availability
  FOR ALL USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.is_club_admin_for_member(member_id)
  );


-- ============================================================================
-- board_orders (club-scoped via team)
-- ============================================================================

DROP POLICY IF EXISTS board_orders_select ON public.board_orders;
CREATE POLICY board_orders_select ON public.board_orders
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND public.is_club_member(t.club_id)
    )
  );

DROP POLICY IF EXISTS board_orders_write ON public.board_orders;
CREATE POLICY board_orders_write ON public.board_orders
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND public.is_club_admin(t.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = board_orders.team_id
      AND public.is_club_admin(t.club_id)
    )
  );


-- ============================================================================
-- contribution_rates (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS contribution_rates_select ON public.contribution_rates;
CREATE POLICY contribution_rates_select ON public.contribution_rates
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS contribution_rates_write ON public.contribution_rates;
CREATE POLICY contribution_rates_write ON public.contribution_rates
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- documents (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS documents_select ON public.documents;
CREATE POLICY documents_select ON public.documents
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS documents_write ON public.documents;
CREATE POLICY documents_write ON public.documents
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- dwz_history (self + club members read, admin write)
-- ============================================================================

DROP POLICY IF EXISTS dwz_history_select ON public.dwz_history;
CREATE POLICY dwz_history_select ON public.dwz_history
  FOR SELECT USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.shares_club_with(member_id)
  );

DROP POLICY IF EXISTS dwz_history_write ON public.dwz_history;
CREATE POLICY dwz_history_write ON public.dwz_history
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin_for_member(member_id)
  );


-- ============================================================================
-- events (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS events_write ON public.events;
CREATE POLICY events_write ON public.events
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- games (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS games_select ON public.games;
CREATE POLICY games_select ON public.games
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS games_write ON public.games;
CREATE POLICY games_write ON public.games
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- match_results (club-scoped via match -> season)
-- ============================================================================

DROP POLICY IF EXISTS match_results_select ON public.match_results;
CREATE POLICY match_results_select ON public.match_results
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND public.is_club_member(s.club_id)
    )
  );

DROP POLICY IF EXISTS match_results_write ON public.match_results;
CREATE POLICY match_results_write ON public.match_results
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND public.is_club_admin(s.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.seasons s ON s.id = m.season_id
      WHERE m.id = match_results.match_id
      AND public.is_club_admin(s.club_id)
    )
  );


-- ============================================================================
-- matches (club-scoped via season)
-- ============================================================================

DROP POLICY IF EXISTS matches_select ON public.matches;
CREATE POLICY matches_select ON public.matches
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND public.is_club_member(s.club_id)
    )
  );

DROP POLICY IF EXISTS matches_write ON public.matches;
CREATE POLICY matches_write ON public.matches
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND public.is_club_admin(s.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id = matches.season_id
      AND public.is_club_admin(s.club_id)
    )
  );


-- ============================================================================
-- media_assets (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS media_assets_select ON public.media_assets;
CREATE POLICY media_assets_select ON public.media_assets
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS media_assets_write ON public.media_assets;
CREATE POLICY media_assets_write ON public.media_assets
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- media_consents (self + club members read, admin write)
-- ============================================================================

DROP POLICY IF EXISTS media_consents_select ON public.media_consents;
CREATE POLICY media_consents_select ON public.media_consents
  FOR SELECT USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND public.is_club_member(ma.club_id)
    )
  );

DROP POLICY IF EXISTS media_consents_write ON public.media_consents;
CREATE POLICY media_consents_write ON public.media_consents
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND public.is_club_admin(ma.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_consents.media_asset_id
      AND public.is_club_admin(ma.club_id)
    )
  );


-- ============================================================================
-- meeting_protocols (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS meeting_protocols_select ON public.meeting_protocols;
CREATE POLICY meeting_protocols_select ON public.meeting_protocols
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS meeting_protocols_write ON public.meeting_protocols;
CREATE POLICY meeting_protocols_write ON public.meeting_protocols
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- member_status_history (self + club members read, admin write)
-- ============================================================================

DROP POLICY IF EXISTS member_status_history_select ON public.member_status_history;
CREATE POLICY member_status_history_select ON public.member_status_history
  FOR SELECT USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.shares_club_with(member_id)
  );

DROP POLICY IF EXISTS member_status_history_write ON public.member_status_history;
CREATE POLICY member_status_history_write ON public.member_status_history
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin_for_member(member_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin_for_member(member_id)
  );


-- ============================================================================
-- newsletters (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS newsletters_select ON public.newsletters;
CREATE POLICY newsletters_select ON public.newsletters
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS newsletters_write ON public.newsletters;
CREATE POLICY newsletters_write ON public.newsletters
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- page_blocks (club-scoped via page)
-- ============================================================================

DROP POLICY IF EXISTS page_blocks_select ON public.page_blocks;
CREATE POLICY page_blocks_select ON public.page_blocks
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND public.is_club_member(p.club_id)
    )
  );

DROP POLICY IF EXISTS page_blocks_write ON public.page_blocks;
CREATE POLICY page_blocks_write ON public.page_blocks
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND public.is_club_admin(p.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_blocks.page_id
      AND public.is_club_admin(p.club_id)
    )
  );


-- ============================================================================
-- page_revisions (club-scoped via page)
-- ============================================================================

DROP POLICY IF EXISTS page_revisions_select ON public.page_revisions;
CREATE POLICY page_revisions_select ON public.page_revisions
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND public.is_club_member(p.club_id)
    )
  );

DROP POLICY IF EXISTS page_revisions_write ON public.page_revisions;
CREATE POLICY page_revisions_write ON public.page_revisions
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND public.is_club_admin(p.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.pages p
      WHERE p.id = page_revisions.page_id
      AND public.is_club_admin(p.club_id)
    )
  );


-- ============================================================================
-- pages (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS pages_select ON public.pages;
CREATE POLICY pages_select ON public.pages
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS pages_write ON public.pages;
CREATE POLICY pages_write ON public.pages
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- payments (self + admin read, admin write)
-- ============================================================================

DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments
  FOR SELECT USING (
    public.is_super_admin()
    OR member_id = public.get_member_id()
    OR public.is_club_admin(club_id)
  );

DROP POLICY IF EXISTS payments_write ON public.payments;
CREATE POLICY payments_write ON public.payments
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- seasons (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS seasons_select ON public.seasons;
CREATE POLICY seasons_select ON public.seasons
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS seasons_write ON public.seasons;
CREATE POLICY seasons_write ON public.seasons
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- sepa_exports (admin only)
-- ============================================================================

DROP POLICY IF EXISTS sepa_exports_all ON public.sepa_exports;
CREATE POLICY sepa_exports_all ON public.sepa_exports
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- team_memberships (club-scoped via team)
-- ============================================================================

DROP POLICY IF EXISTS team_memberships_select ON public.team_memberships;
CREATE POLICY team_memberships_select ON public.team_memberships
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND public.is_club_member(t.club_id)
    )
  );

DROP POLICY IF EXISTS team_memberships_write ON public.team_memberships;
CREATE POLICY team_memberships_write ON public.team_memberships
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND public.is_club_admin(t.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_memberships.team_id
      AND public.is_club_admin(t.club_id)
    )
  );


-- ============================================================================
-- teams (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS teams_select ON public.teams;
CREATE POLICY teams_select ON public.teams
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS teams_write ON public.teams;
CREATE POLICY teams_write ON public.teams
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- tournament_participants (club-scoped via tournament)
-- ============================================================================

DROP POLICY IF EXISTS tournament_participants_select ON public.tournament_participants;
CREATE POLICY tournament_participants_select ON public.tournament_participants
  FOR SELECT USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND public.is_club_member(tr.club_id)
    )
  );

DROP POLICY IF EXISTS tournament_participants_write ON public.tournament_participants;
CREATE POLICY tournament_participants_write ON public.tournament_participants
  FOR ALL USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND public.is_club_admin(tr.club_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.tournaments tr
      WHERE tr.id = tournament_participants.tournament_id
      AND public.is_club_admin(tr.club_id)
    )
  );


-- ============================================================================
-- tournaments (club-scoped)
-- ============================================================================

DROP POLICY IF EXISTS tournaments_select ON public.tournaments;
CREATE POLICY tournaments_select ON public.tournaments
  FOR SELECT USING (
    public.is_super_admin()
    OR public.is_club_member(club_id)
  );

DROP POLICY IF EXISTS tournaments_write ON public.tournaments;
CREATE POLICY tournaments_write ON public.tournaments
  FOR ALL USING (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  )
  WITH CHECK (
    public.is_super_admin()
    OR public.is_club_admin(club_id)
  );


-- ============================================================================
-- waitlist_applications (super admin only)
-- ============================================================================

DROP POLICY IF EXISTS waitlist_applications_all ON public.waitlist_applications;
CREATE POLICY waitlist_applications_all ON public.waitlist_applications
  FOR ALL USING (
    public.is_super_admin()
  )
  WITH CHECK (
    public.is_super_admin()
  );


-- ============================================================================
-- audit_log (admin read, admin write)
-- ============================================================================

DROP POLICY IF EXISTS audit_log_select ON public.audit_log;
CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT USING (
    public.is_super_admin()
    OR (club_id IS NOT NULL AND public.is_club_admin(club_id))
  );

DROP POLICY IF EXISTS audit_log_write ON public.audit_log;
CREATE POLICY audit_log_write ON public.audit_log
  FOR ALL USING (
    public.is_super_admin()
    OR (club_id IS NOT NULL AND public.is_club_admin(club_id))
  )
  WITH CHECK (
    public.is_super_admin()
    OR (club_id IS NOT NULL AND public.is_club_admin(club_id))
  );
