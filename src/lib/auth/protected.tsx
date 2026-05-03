import { createServerAuthClient } from "@/lib/insforge/server-auth";
import { redirect } from "next/navigation";

interface ProtectedPageProps {
  children: React.ReactNode;
}

/**
 * Server Component Wrapper für geschützte Seiten
 */
export async function ProtectedPage({ children }: ProtectedPageProps) {
  const client = await createServerAuthClient();
  const { data: { user } } = await client.auth.getCurrentUser();

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
  const client = await createServerAuthClient();
  const { data: { user }, error } = await client.auth.getCurrentUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { user, client };
}

/**
 * Optional Auth - gibt User zurück wenn eingeloggt, sonst null
 */
export async function optionalAuth() {
  const client = await createServerAuthClient();
  const { data: { user } } = await client.auth.getCurrentUser();
  
  return { user, client };
}
