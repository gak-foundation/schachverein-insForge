-- Helper function to get current user's club_id efficiently
CREATE OR REPLACE FUNCTION current_user_club_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT club_id FROM auth_user WHERE id = auth.uid();
$$;

-- ============================================
-- Enable RLS on all tenant-scoped tables
-- ============================================

-- Tables with direct club_id
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sepa_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

-- Tables without direct club_id (need EXISTS subqueries)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_consents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Tenant isolation policies for tables WITH direct club_id
-- ============================================

CREATE POLICY tenant_isolation_members ON members
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_events ON events
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_tournaments ON tournaments
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_teams ON teams
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_games ON games
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_pages ON pages
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_media_assets ON media_assets
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_payments ON payments
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_sepa_exports ON sepa_exports
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_contribution_rates ON contribution_rates
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_seasons ON seasons
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_documents ON documents
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_newsletters ON newsletters
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_meeting_protocols ON meeting_protocols
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_club_invitations ON club_invitations
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_audit_log ON audit_log
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_club_memberships ON club_memberships
FOR ALL TO authenticated
USING (club_id = current_user_club_id())
WITH CHECK (club_id = current_user_club_id());

-- ============================================
-- Tenant isolation policies for tables WITHOUT direct club_id (EXISTS subqueries)
-- ============================================

CREATE POLICY tenant_isolation_matches ON matches
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM seasons s
    WHERE s.id = matches.season_id
    AND s.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seasons s
    WHERE s.id = matches.season_id
    AND s.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_match_results ON match_results
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matches m
    JOIN seasons s ON s.id = m.season_id
    WHERE m.id = match_results.match_id
    AND s.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches m
    JOIN seasons s ON s.id = m.season_id
    WHERE m.id = match_results.match_id
    AND s.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_board_orders ON board_orders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = board_orders.team_id
    AND t.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = board_orders.team_id
    AND t.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_team_memberships ON team_memberships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_memberships.team_id
    AND t.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_memberships.team_id
    AND t.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_tournament_participants ON tournament_participants
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments tr
    WHERE tr.id = tournament_participants.tournament_id
    AND tr.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments tr
    WHERE tr.id = tournament_participants.tournament_id
    AND tr.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_page_blocks ON page_blocks
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = page_blocks.page_id
    AND p.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = page_blocks.page_id
    AND p.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_page_revisions ON page_revisions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = page_revisions.page_id
    AND p.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pages p
    WHERE p.id = page_revisions.page_id
    AND p.club_id = current_user_club_id()
  )
);

CREATE POLICY tenant_isolation_media_consents ON media_consents
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM media_assets ma
    WHERE ma.id = media_consents.media_asset_id
    AND ma.club_id = current_user_club_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM media_assets ma
    WHERE ma.id = media_consents.media_asset_id
    AND ma.club_id = current_user_club_id()
  )
);
