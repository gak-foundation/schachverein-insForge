-- Trigger fuer automatische Profilerstellung in public.auth_user
-- Mit Unterstuetzung fuer clubId aus raw_user_meta_data (Subdomain-Tenancy)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auth_user (id, name, email, email_verified, image, role, club_id, created_at, updated_at)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'mitglied'),
    (NEW.raw_user_meta_data->>'club_id')::uuid,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger loeschen falls existiert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger erstellen
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
