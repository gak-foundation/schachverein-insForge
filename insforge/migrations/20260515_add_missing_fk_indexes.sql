-- Missing Foreign Key Indexes
-- Generated from InsForge Backend Advisor (62 issues)
-- All statements use CONCURRENTLY + IF NOT EXISTS for zero-downtime safety

-- ============================================================
-- audit_log
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_club_id ON public.audit_log(club_id);

-- ============================================================
-- auth_user
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_auth_user_active_club_id ON public.auth_user(active_club_id);
CREATE INDEX IF NOT EXISTS idx_auth_user_club_id ON public.auth_user(club_id);
CREATE INDEX IF NOT EXISTS idx_auth_user_member_id ON public.auth_user(member_id);

-- ============================================================
-- availability
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_availability_match_id ON public.availability(match_id);
CREATE INDEX IF NOT EXISTS idx_availability_member_id ON public.availability(member_id);

-- ============================================================
-- board_orders
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_board_orders_member_id ON public.board_orders(member_id);
CREATE INDEX IF NOT EXISTS idx_board_orders_team_id ON public.board_orders(team_id);

-- ============================================================
-- club_addons
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_club_addons_club_id ON public.club_addons(club_id);

-- ============================================================
-- club_invitations
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_club_invitations_club_id ON public.club_invitations(club_id);
CREATE INDEX IF NOT EXISTS idx_club_invitations_invited_by ON public.club_invitations(invited_by);

-- ============================================================
-- club_memberships
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON public.club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_invited_by ON public.club_memberships(invited_by);

-- ============================================================
-- contribution_rates
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contribution_rates_club_id ON public.contribution_rates(club_id);

-- ============================================================
-- documents
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_documents_club_id ON public.documents(club_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- ============================================================
-- dwz_history
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dwz_history_member_id ON public.dwz_history(member_id);

-- ============================================================
-- events
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- ============================================================
-- games
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_games_black_id ON public.games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_club_id ON public.games(club_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament_id ON public.games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_games_white_id ON public.games(white_id);

-- ============================================================
-- match_results
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_match_results_away_player_id ON public.match_results(away_player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_game_id ON public.match_results(game_id);
CREATE INDEX IF NOT EXISTS idx_match_results_home_player_id ON public.match_results(home_player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON public.match_results(match_id);

-- ============================================================
-- matches
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON public.matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON public.matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_season_id ON public.matches(season_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches(tournament_id);

-- ============================================================
-- media_assets
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_assets_club_id ON public.media_assets(club_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);

-- ============================================================
-- media_consents
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_consents_media_asset_id ON public.media_consents(media_asset_id);

-- ============================================================
-- meeting_protocols
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_meeting_protocols_club_id ON public.meeting_protocols(club_id);
CREATE INDEX IF NOT EXISTS idx_meeting_protocols_event_id ON public.meeting_protocols(event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_protocols_signed_by ON public.meeting_protocols(signed_by);

-- ============================================================
-- members
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_club_id ON public.members(club_id);

-- ============================================================
-- member_status_history
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_member_status_history_member_id ON public.member_status_history(member_id);

-- ============================================================
-- newsletters
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_newsletters_club_id ON public.newsletters(club_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_by ON public.newsletters(sent_by);

-- ============================================================
-- page_blocks
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_page_blocks_created_by ON public.page_blocks(created_by);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON public.page_blocks(page_id);

-- ============================================================
-- page_revisions
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_page_revisions_author_id ON public.page_revisions(author_id);
CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id ON public.page_revisions(page_id);

-- ============================================================
-- pages
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pages_club_id ON public.pages(club_id);

-- ============================================================
-- payments
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payments_club_id ON public.payments(club_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_sepa_export_id ON public.payments(sepa_export_id);

-- ============================================================
-- seasons
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_seasons_club_id ON public.seasons(club_id);

-- ============================================================
-- sepa_exports
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sepa_exports_club_id ON public.sepa_exports(club_id);

-- ============================================================
-- team_memberships
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_team_memberships_member_id ON public.team_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_season_id ON public.team_memberships(season_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON public.team_memberships(team_id);

-- ============================================================
-- teams
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON public.teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_teams_club_id ON public.teams(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_season_id ON public.teams(season_id);

-- ============================================================
-- tournament_participants
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tournament_participants_member_id ON public.tournament_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);

-- ============================================================
-- tournaments
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tournaments_club_id ON public.tournaments(club_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_season_id ON public.tournaments(season_id);

-- ============================================================
-- impersonation_sessions
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_target_club_id ON public.impersonation_sessions(target_club_id);
