"use client";

import { createClient, insforge } from "@/lib/insforge";
import { useEffect, useState } from "react";

// Get the app base URL for auth redirects
// In browser, defaults to current origin; falls back to env var
function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Client-side auth client
export const authClient = {
  useSession: () => {
    const [session, setSession] = useState<{
      user: {
        id: string;
        email?: string;
        name?: string;
        role?: string;
        permissions?: string[];
        memberId?: string;
        clubId?: string;
        isSuperAdmin?: boolean;
        image?: string;
      } | null;
    } | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
      const client = createClient();

      const fetchProfile = async () => {
        try {
          const response = await fetch("/api/user/profile");
          if (response.status === 401) {
            // User exists in Auth but not in our DB (or session is invalid)
            // Clear local session to force re-login
            await client.auth.signOut();
            return null;
          }
          if (!response.ok) return null;
          const { profile } = await response.json();
          return profile;
        } catch (error) {
          console.error("Error fetching profile:", error);
          return null;
        }
      };

      // Get initial session
      client.auth.getCurrentUser().then(async ({ data, error }: any) => {
        if (error) {
          const isIgnorableError =
            error.code === "refresh_token_not_found" ||
            error.message?.toLowerCase().includes("sub claim in jwt does not exist") ||
            error.message?.toLowerCase().includes("no refresh token") ||
            error.message?.toLowerCase().includes("invalid csrf token");

          if (isIgnorableError) {
            await client.auth.signOut();
          } else {
            console.error("Error getting session:", error.message);
          }
          setSession(null);
          setIsPending(false);
          return;
        }

        if (data?.user) {
          const profile = await fetchProfile();
          if (!profile) {
            setSession(null);
          } else {
            setSession({
              user: {
                id: data.user.id,
                email: data.user.email,
                name: profile.name || data.user.profile?.name,
                image: profile.image || data.user.profile?.avatar_url,
                role: profile.role || "mitglied",
                permissions: profile.permissions || [],
                memberId: profile.memberId,
                clubId: profile.clubId,
                isSuperAdmin: profile.isSuperAdmin || false,
              },
            });
          }
        } else {
          setSession(null);
        }
        setIsPending(false);
      });

      // Check for changes periodically (InsForge doesn't have onAuthStateChange)
      const interval = setInterval(async () => {
        try {
          const { data } = await client.auth.getCurrentUser();
          if (!data?.user) {
            setSession(null);
          }
        } catch {
          // Ignore errors
        }
      }, 60000);

      return () => clearInterval(interval);
    }, []);

    return { data: session, isPending };
  },

  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const client = createClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
  },

  signUp: {
    email: async ({ email, password, name, slug, invitationToken }: { email: string; password: string; name?: string; slug?: string; invitationToken?: string }) => {
      const client = createClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        name: name || email.split('@')[0],
      });
      return { data, error };
    },
  },

  signOut: async () => {
    const client = createClient();
    await client.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
  },

  forgetPassword: async ({ email }: { email: string }) => {
    const client = createClient();
    const { data, error } = await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: `${getAppUrl()}/auth/reset-password`,
    });
    return { data, error };
},
};

export const { useSession } = authClient;

// Helper to check if user is authenticated
export function useIsAuthenticated() {
  const { data: session } = useSession();
  return !!session?.user;
}

// Helper to get current user
export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user;
}

// Handle auth errors
export function handleAuthError(error: { code?: string; message?: string }) {
  const errorMessages: Record<string, string> = {
    "invalid_credentials": "Ungültige E-Mail oder Passwort",
    "email_not_confirmed": "E-Mail nicht bestätigt",
    "user_already_exists": "Benutzer existiert bereits",
    "invalid_token": "Ungültiger Token",
    "session_expired": "Sitzung abgelaufen",
  };

  return errorMessages[error.code || ""] || error.message || "Ein Fehler ist aufgetreten";
}
