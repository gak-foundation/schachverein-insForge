-- Migration: Sync auth.users to public.auth_user
-- Problem: New Supabase Auth users don't exist in public.auth_user
-- causing RLS failures / "Tenant or user not found" on Drizzle lookups.
-- Fix: Backfill existing users + live trigger to keep tables in sync.

-- ============================================================================
-- 1. Backfill existing auth users into public.auth_user
-- ============================================================================

INSERT INTO public.auth_user (id, email, email_verified, name, created_at, updated_at)
SELECT
  u.id::text,
  u.email,
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  COALESCE(u.raw_user_meta_data->>'name', u.email),
  COALESCE(u.created_at, NOW()),
  COALESCE(u.updated_at, NOW())
FROM auth.users u
LEFT JOIN public.auth_user au ON au.id = u.id::text
WHERE au.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Trigger function to keep auth_user in sync with auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.auth_user WHERE id = OLD.id::text;
    RETURN OLD;
  END IF;

  INSERT INTO public.auth_user (id, email, email_verified, name, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    name = COALESCE(EXCLUDED.name, public.auth_user.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. Attach trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();
