import { createServerClient } from "@/lib/insforge";
import { redirect } from "next/navigation";

interface ProtectedPageProps {
  children: React.ReactNode;
}

/**
 * Server Component Wrapper für geschützte Seiten
 */
export async function ProtectedPage({ children }: ProtectedPageProps) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}

/**
 * Hook-ähnliche Funktion für Server Components
 * Gibt den User zurück oder redirected zum Login
 */
export async function requireAuth() {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getCurrentUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { user, supabase };
}

/**
 * Optional Auth - gibt User zurück wenn eingeloggt, sonst null
 */
export async function optionalAuth() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getCurrentUser();
  
  return { user, supabase };
}
