"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
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
      const supabase = getSupabaseClient();

      const fetchProfile = async () => {
        try {
          const response = await fetch("/api/user/profile");
          if (response.status === 401) {
            // User exists in Auth but not in our DB (or session is invalid)
            // Clear local session to force re-login
            await supabase.auth.signOut({ scope: "local" });
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
      supabase.auth.getSession().then(async ({ data: { session: authSession }, error }) => {
        if (error) {
          const isIgnorableError =
            error.code === "refresh_token_not_found" ||
            error.message?.toLowerCase().includes("sub claim in jwt does not exist");

          if (isIgnorableError) {
            await supabase.auth.signOut({ scope: "local" });
          } else {
            console.error("Error getting session:", error.message);
          }
          setSession(null);
          setIsPending(false);
          return;
        }

        if (authSession?.user) {
          const profile = await fetchProfile();
          if (!profile) {
            setSession(null);
          } else {
            setSession({
              user: {
                id: authSession.user.id,
                email: authSession.user.email,
                name: profile.name || authSession.user.user_metadata?.name,
                image: profile.image || authSession.user.user_metadata?.avatar_url,
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

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
        if (authSession?.user) {
          const profile = await fetchProfile();
          if (!profile) {
            setSession(null);
          } else {
            setSession({
              user: {
                id: authSession.user.id,
                email: authSession.user.email,
                name: profile.name || authSession.user.user_metadata?.name,
                image: profile.image || authSession.user.user_metadata?.avatar_url,
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
      });

      return () => subscription.unsubscribe();
    }, []);

    return { data: session, isPending };
  },

  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
  },

  signUp: {
    email: async ({ email, password, name, slug, invitationToken }: { email: string; password: string; name?: string; slug?: string; invitationToken?: string }) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/callback`,
          data: { name, slug, invitation_token: invitationToken },
        },
      });
      return { data, error };
    },
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  },

  forgetPassword: async ({ email }: { email: string }) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/auth/reset-password`,
    });
    return { data, error };
  },

  changePassword: async ({ newPassword }: { newPassword: string }) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },
};

// Export commonly used hooks
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
