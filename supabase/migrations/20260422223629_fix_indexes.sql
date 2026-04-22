-- Fix unindexed foreign keys and remove unused indexes
-- Generated from Supabase database linter output

-- ============================================
-- Add indexes for foreign keys without covering indexes
-- ============================================

-- availability table
CREATE INDEX IF NOT EXISTS idx_availability_match_id ON public.availability(match_id);
CREATE INDEX IF NOT EXISTS idx_availability_member_id ON public.availability(member_id);

-- board_orders table
CREATE INDEX IF NOT EXISTS idx_board_orders_member_id ON public.board_orders(member_id);
CREATE INDEX IF NOT EXISTS idx_board_orders_season_id ON public.board_orders(season_id);

-- club_invitations table
CREATE INDEX IF NOT EXISTS idx_club_invitations_invited_by ON public.club_invitations(invited_by);

-- club_memberships table
CREATE INDEX IF NOT EXISTS idx_club_memberships_invited_by ON public.club_memberships(invited_by);

-- documents table
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- events table
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- match_results table
CREATE INDEX IF NOT EXISTS idx_match_results_away_player_id ON public.match_results(away_player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_game_id ON public.match_results(game_id);
CREATE INDEX IF NOT EXISTS idx_match_results_home_player_id ON public.match_results(home_player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON public.match_results(match_id);

-- matches table
CREATE INDEX IF NOT EXISTS idx_matches_away_team_id ON public.matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_home_team_id ON public.matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches(tournament_id);

-- media_assets table
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);

-- media_consents table
CREATE INDEX IF NOT EXISTS idx_media_consents_member_id ON public.media_consents(member_id);

-- meeting_protocols table
CREATE INDEX IF NOT EXISTS idx_meeting_protocols_signed_by ON public.meeting_protocols(signed_by);

-- newsletters table
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_by ON public.newsletters(sent_by);

-- page_blocks table
CREATE INDEX IF NOT EXISTS idx_page_blocks_created_by ON public.page_blocks(created_by);

-- page_revisions table
CREATE INDEX IF NOT EXISTS idx_page_revisions_author_id ON public.page_revisions(author_id);

-- payments table
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);

-- team_memberships table
CREATE INDEX IF NOT EXISTS idx_team_memberships_member_id ON public.team_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_season_id ON public.team_memberships(season_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON public.team_memberships(team_id);

-- teams table
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON public.teams(captain_id);
CREATE INDEX IF NOT EXISTS idx_teams_season_id ON public.teams(season_id);

-- tournament_participants table
CREATE INDEX IF NOT EXISTS idx_tournament_participants_member_id ON public.tournament_participants(member_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);

-- tournaments table
CREATE INDEX IF NOT EXISTS idx_tournaments_season_id ON public.tournaments(season_id);

-- ============================================
-- Drop unused indexes
-- ============================================

-- matches table
DROP INDEX IF EXISTS public.matches_season_idx;
DROP INDEX IF EXISTS public.matches_date_idx;

-- events table
DROP INDEX IF EXISTS public.events_club_idx;

-- documents table
DROP INDEX IF EXISTS public.documents_club_idx;

-- meeting_protocols table
DROP INDEX IF EXISTS public.meeting_protocols_club_idx;
DROP INDEX IF EXISTS public.meeting_protocols_event_idx;

-- newsletters table
DROP INDEX IF EXISTS public.newsletters_club_idx;

-- member_status_history table
DROP INDEX IF EXISTS public.member_status_history_member_idx;

-- clubs table
DROP INDEX IF EXISTS public.clubs_stripe_customer_idx;

-- club_invitations table
DROP INDEX IF EXISTS public.club_invitations_club_idx;
DROP INDEX IF EXISTS public.club_invitations_token_idx;
DROP INDEX IF EXISTS public.club_invitations_email_idx;

-- club_memberships table
DROP INDEX IF EXISTS public.club_memberships_member_idx;
DROP INDEX IF EXISTS public.club_memberships_club_idx;

-- members table
DROP INDEX IF EXISTS public.members_email_idx;
DROP INDEX IF EXISTS public.members_dwz_id_idx;
DROP INDEX IF EXISTS public.members_parent_id_idx;

-- dwz_history table
DROP INDEX IF EXISTS public.dwz_history_member_date_idx;

-- seasons table
DROP INDEX IF EXISTS public.seasons_club_idx;

-- board_orders table
DROP INDEX IF EXISTS public.board_orders_team_season_idx;

-- teams table
DROP INDEX IF EXISTS public.teams_club_idx;

-- games table
DROP INDEX IF EXISTS public.games_club_idx;
DROP INDEX IF EXISTS public.games_tournament_round_idx;
DROP INDEX IF EXISTS public.games_white_idx;
DROP INDEX IF EXISTS public.games_black_idx;

-- tournaments table
DROP INDEX IF EXISTS public.tournaments_club_idx;

-- contribution_rates table
DROP INDEX IF EXISTS public.contribution_rates_club_idx;

-- payments table
DROP INDEX IF EXISTS public.payments_club_idx;
DROP INDEX IF EXISTS public.payments_sepa_export_idx;

-- sepa_exports table
DROP INDEX IF EXISTS public.sepa_exports_club_idx;

-- audit_log table
DROP INDEX IF EXISTS public.audit_log_club_idx;
DROP INDEX IF EXISTS public.audit_log_entity_idx;

-- auth_user table
DROP INDEX IF EXISTS public.auth_user_member_id_idx;
DROP INDEX IF EXISTS public.auth_user_active_club_idx;

-- media_assets table
DROP INDEX IF EXISTS public.media_assets_club_idx;

-- page_blocks table
DROP INDEX IF EXISTS public.page_blocks_page_idx;

-- page_revisions table
DROP INDEX IF EXISTS public.page_revisions_page_idx;

-- pages table
DROP INDEX IF EXISTS public.pages_club_idx;

-- waitlist_applications table
DROP INDEX IF EXISTS public.waitlist_slug_idx;
DROP INDEX IF EXISTS public.waitlist_status_idx;
DROP INDEX IF EXISTS public.waitlist_email_idx;
DROP INDEX IF EXISTS public.waitlist_type_idx;
DROP INDEX IF EXISTS public.waitlist_ip_hash_idx;
