import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface ProtectedPageProps {
  children: React.ReactNode;
}

/**
 * Server Component Wrapper für geschützte Seiten
 * Verwendung: In einer page.tsx einfach um den Content legen
 * 
 * Beispiel:
 * export default async function DashboardPage() {
 *   return (
 *     <ProtectedPage>
 *       <DashboardContent />
 *     </ProtectedPage>
 *   );
 * }
 */
export async function ProtectedPage({ children }: ProtectedPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { user, supabase };
}

/**
 * Optional Auth - gibt User zurück wenn eingeloggt, sonst null
 */
export async function optionalAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return { user, supabase };
}
