-- Fix security linter warnings for SECURITY DEFINER functions in public schema
-- Revokes EXECUTE permission from PUBLIC, anon, and authenticated roles
-- for functions that should only be triggered by the system or internal processes.

-- 1. handle_new_user (Auth Trigger)
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_catalog;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 2. handle_auth_user_sync (Auth Sync Trigger)
ALTER FUNCTION public.handle_auth_user_sync() SET search_path = public, pg_catalog;
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM authenticated;

-- 3. rls_auto_enable (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable') THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_catalog;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;';
    END IF;
END $$;
