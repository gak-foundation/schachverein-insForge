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

-- Enable RLS on tenant tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies using the helper function
CREATE POLICY tenant_isolation_members ON members
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_events ON events
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_tournaments ON tournaments
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_teams ON teams
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_games ON games
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_pages ON pages
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_finance ON finance_records
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_documents ON documents
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_protocols ON protocols
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_seasons ON seasons
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_invitations ON club_invitations
FOR ALL TO authenticated
USING (club_id = current_user_club_id());

CREATE POLICY tenant_isolation_audit ON audit_logs
FOR ALL TO authenticated
USING (club_id = current_user_club_id());
