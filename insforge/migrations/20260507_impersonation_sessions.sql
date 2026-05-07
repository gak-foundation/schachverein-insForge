-- Impersonation Sessions Tabelle
-- Serverseitige Verwaltung von Super-Admin Impersonationen

CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id character varying(36) NOT NULL,
  target_club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  token_hash character varying(64) NOT NULL UNIQUE,
  started_at timestamp without time zone NOT NULL DEFAULT now(),
  expires_at timestamp without time zone NOT NULL,
  ended_at timestamp without time zone,
  revoked boolean NOT NULL DEFAULT false,
  ip_address character varying(45),
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin_id 
  ON public.impersonation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_token_hash 
  ON public.impersonation_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active 
  ON public.impersonation_sessions(admin_id, revoked, ended_at) 
  WHERE revoked = false AND ended_at IS NULL;

ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impersonation_sessions_select_admin" ON public.impersonation_sessions
  FOR SELECT TO authenticated
  USING (admin_id = auth.uid() OR is_super_admin = true);

CREATE POLICY "impersonation_sessions_insert_service" ON public.impersonation_sessions
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin = true);

CREATE POLICY "impersonation_sessions_update_admin" ON public.impersonation_sessions
  FOR UPDATE TO authenticated
  USING (admin_id = auth.uid() OR is_super_admin = true)
  WITH CHECK (admin_id = auth.uid() OR is_super_admin = true);
