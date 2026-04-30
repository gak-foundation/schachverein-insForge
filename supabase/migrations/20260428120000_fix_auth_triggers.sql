-- Fix signup trigger: cast role to member_role enum properly
-- The handle_new_user() trigger failed because text values were inserted
-- into the auth_user.role column which is of type member_role (custom enum).
-- PostgreSQL cannot implicitly cast text to custom enum types.
--
-- Also reconciles duplicate triggers (handle_new_user + handle_auth_user_sync)
-- into a single robust function that handles INSERT, UPDATE and DELETE.

-- ============================================================================
-- 1. Remove old triggers first
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;

-- ============================================================================
-- 2. Create consolidated trigger function with proper enum casting
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_role public.member_role;
BEGIN
    -- DELETE: remove corresponding auth_user row
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.auth_user WHERE id = OLD.id::text;
        RETURN OLD;
    END IF;

    -- Resolve role from metadata, cast explicitly to member_role enum
    BEGIN
        v_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.member_role,
            'mitglied'::public.member_role
        );
    EXCEPTION WHEN OTHERS THEN
        -- Fallback if metadata role is not a valid member_role value
        v_role := 'mitglied'::public.member_role;
    END;

    -- INSERT (with ON CONFLICT) handles both new users and updates
    INSERT INTO public.auth_user (
        id, name, email, email_verified, image, role, club_id, created_at, updated_at
    )
    VALUES (
        NEW.id::text,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.email
        ),
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        NEW.raw_user_meta_data->>'avatar_url',
        v_role,
        (NEW.raw_user_meta_data->>'club_id')::uuid,
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        name = COALESCE(EXCLUDED.name, public.auth_user.name),
        image = COALESCE(EXCLUDED.image, public.auth_user.image),
        role = COALESCE(EXCLUDED.role, public.auth_user.role),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. Re-attach trigger
-- ============================================================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. Revoke execute from public roles (security)
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ============================================================================
-- 5. Drop the old duplicate function
-- ============================================================================
DROP FUNCTION IF EXISTS public.handle_auth_user_sync();
