-- RLS Policies für schach.studio
-- Alle Tabellen erhalten Row-Level Security basierend auf Club-Mitgliedschaft

-- ============================================================
-- Helper: Prüft ob ein User Mitglied eines Clubs ist
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_club_member(target_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_user
    WHERE id = auth.uid()
    AND (club_id = target_club_id OR is_super_admin = true)
  );
$$;

-- ============================================================
-- Helper: Gibt die Club-ID des aktuellen Users zurück
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_club_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT club_id FROM public.auth_user WHERE id = auth.uid();
$$;

-- ============================================================
-- Helper: Prüft ob User Admin/Vorstand im Club ist
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_club_admin(target_club_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_user
    WHERE id = auth.uid()
    AND club_id = target_club_id
    AND (role IN ('admin', 'vorstand') OR is_super_admin = true)
  );
$$;

-- ============================================================
-- 1. auth_user — jeder sieht nur seinen eigenen Eintrag
-- ============================================================
ALTER TABLE public.auth_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_user_select_own" ON public.auth_user
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_super_admin = true);

CREATE POLICY "auth_user_update_own" ON public.auth_user
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "auth_user_insert_service" ON public.auth_user
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 2. clubs — öffentlich lesbar, nur Admins schreiben
-- ============================================================
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_select_public" ON public.clubs
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "clubs_update_admin" ON public.clubs
  FOR UPDATE TO authenticated
  USING (is_club_admin(id))
  WITH CHECK (is_club_admin(id));

CREATE POLICY "clubs_insert_super_admin" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin = true);

CREATE POLICY "clubs_delete_super_admin" ON public.clubs
  FOR DELETE TO authenticated
  USING (is_super_admin = true);

-- ============================================================
-- 3. Tabellen mit direkter club_id (19 Tabellen)
-- ============================================================

-- Generische Policies: Mitglieder sehen nur Daten ihres Clubs
DO $$
DECLARE
  tbl text;
  tables_with_club_id text[] := ARRAY[
    'audit_log', 'club_addons', 'club_invitations', 'club_memberships',
    'contribution_rates', 'documents', 'events', 'games', 'media_assets',
    'meeting_protocols', 'members', 'newsletters', 'pages', 'payments',
    'seasons', 'sepa_exports', 'teams', 'tournaments'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_club_id
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (is_club_member(club_id));',
      tbl || '_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (is_club_member(club_id));',
      tbl || '_insert', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (is_club_member(club_id)) WITH CHECK (is_club_member(club_id));',
      tbl || '_update', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (is_club_member(club_id));',
      tbl || '_delete', tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 4. Tabellen indirekt über member_id → members.club_id
-- ============================================================

-- availability (member_id)
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_select" ON public.availability
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "availability_insert" ON public.availability
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "availability_update" ON public.availability
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "availability_delete" ON public.availability
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));

-- dwz_history (member_id)
ALTER TABLE public.dwz_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dwz_history_select" ON public.dwz_history
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "dwz_history_insert" ON public.dwz_history
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "dwz_history_delete" ON public.dwz_history
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));

-- member_status_history (member_id)
ALTER TABLE public.member_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member_status_history_select" ON public.member_status_history
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "member_status_history_insert" ON public.member_status_history
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));

-- media_consents (member_id)
ALTER TABLE public.media_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_consents_select" ON public.media_consents
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "media_consents_insert" ON public.media_consents
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));
CREATE POLICY "media_consents_update" ON public.media_consents
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.members WHERE id = member_id)));

-- team_memberships (team_id → teams.club_id)
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_memberships_select" ON public.team_memberships
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "team_memberships_insert" ON public.team_memberships
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "team_memberships_update" ON public.team_memberships
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "team_memberships_delete" ON public.team_memberships
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));

-- tournament_participants (tournament_id → tournaments.club_id)
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournament_participants_select" ON public.tournament_participants
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.tournaments WHERE id = tournament_id)));
CREATE POLICY "tournament_participants_insert" ON public.tournament_participants
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.tournaments WHERE id = tournament_id)));
CREATE POLICY "tournament_participants_update" ON public.tournament_participants
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.tournaments WHERE id = tournament_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.tournaments WHERE id = tournament_id)));
CREATE POLICY "tournament_participants_delete" ON public.tournament_participants
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.tournaments WHERE id = tournament_id)));

-- ============================================================
-- 5. board_orders (team_id → teams.club_id)
-- ============================================================
ALTER TABLE public.board_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "board_orders_select" ON public.board_orders
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "board_orders_insert" ON public.board_orders
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "board_orders_update" ON public.board_orders
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));
CREATE POLICY "board_orders_delete" ON public.board_orders
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = team_id)));

-- ============================================================
-- 6. matches (home_team_id → teams.club_id)
-- ============================================================
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select" ON public.matches
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = home_team_id))
      OR is_club_member((SELECT club_id FROM public.teams WHERE id = away_team_id)));
CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = home_team_id)));
CREATE POLICY "matches_update" ON public.matches
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = home_team_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.teams WHERE id = home_team_id)));
CREATE POLICY "matches_delete" ON public.matches
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.teams WHERE id = home_team_id)));

-- match_results (match_id → matches → teams.club_id)
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_results_select" ON public.match_results
  FOR SELECT TO authenticated
  USING (is_club_member((
    SELECT club_id FROM public.teams WHERE id = (
      SELECT home_team_id FROM public.matches WHERE id = match_id
    )
  )));
CREATE POLICY "match_results_insert" ON public.match_results
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((
    SELECT club_id FROM public.teams WHERE id = (
      SELECT home_team_id FROM public.matches WHERE id = match_id
    )
  )));
CREATE POLICY "match_results_update" ON public.match_results
  FOR UPDATE TO authenticated
  USING (is_club_member((
    SELECT club_id FROM public.teams WHERE id = (
      SELECT home_team_id FROM public.matches WHERE id = match_id
    )
  )))
  WITH CHECK (is_club_member((
    SELECT club_id FROM public.teams WHERE id = (
      SELECT home_team_id FROM public.matches WHERE id = match_id
    )
  )));

-- ============================================================
-- 7. page_blocks / page_revisions (page_id → pages.club_id)
-- ============================================================
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_blocks_select" ON public.page_blocks
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));
CREATE POLICY "page_blocks_insert" ON public.page_blocks
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));
CREATE POLICY "page_blocks_update" ON public.page_blocks
  FOR UPDATE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)))
  WITH CHECK (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));
CREATE POLICY "page_blocks_delete" ON public.page_blocks
  FOR DELETE TO authenticated
  USING (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));

ALTER TABLE public.page_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_revisions_select" ON public.page_revisions
  FOR SELECT TO authenticated
  USING (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));
CREATE POLICY "page_revisions_insert" ON public.page_revisions
  FOR INSERT TO authenticated
  WITH CHECK (is_club_member((SELECT club_id FROM public.pages WHERE id = page_id)));

-- ============================================================
-- 8. waitlist_applications — öffentlich Insert, nur Admin lesen
-- ============================================================
ALTER TABLE public.waitlist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_applications_insert_public" ON public.waitlist_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "waitlist_applications_select_admin" ON public.waitlist_applications
  FOR SELECT TO authenticated
  USING (is_super_admin = true);

CREATE POLICY "waitlist_applications_update_admin" ON public.waitlist_applications
  FOR UPDATE TO authenticated
  USING (is_super_admin = true)
  WITH CHECK (is_super_admin = true);

-- ============================================================
-- 9. Storage Bucket RLS
-- ============================================================
-- avatars: public read, authenticated upload
-- attachments/documents/protocols: nur Club-Mitglieder
-- (Storage RLS wird über storage.objects Tabelle konfiguriert)

-- ============================================================
-- Cleanup: Temporäre DO-Blöcke wurden ausgeführt
-- ============================================================
