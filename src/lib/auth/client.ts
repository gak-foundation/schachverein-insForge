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

async function fetchSession() {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

async function fetchProfile() {
  try {
    const response = await fetch("/api/user/profile");
    if (response.status === 401) {
      return null;
    }
    if (!response.ok) return null;
    const { profile } = await response.json();
    return profile;
  } catch {
    return null;
  }
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
      const checkSession = async () => {
        const user = await fetchSession();
        if (user) {
          const profile = await fetchProfile();
          if (profile) {
            setSession({
              user: {
                id: user.id,
                email: user.email,
                name: profile.name || user.profile?.name,
                image: profile.image || user.profile?.avatar_url,
                role: profile.role ?? "mitglied",
                permissions: profile.permissions || [],
                memberId: profile.memberId,
                clubId: profile.clubId,
                isSuperAdmin: profile.isSuperAdmin || false,
              },
            });
            setIsPending(false);
            return;
          }
        }
        setSession(null);
        setIsPending(false);
      };

      checkSession();

      const interval = setInterval(async () => {
        const user = await fetchSession();
        if (!user) {
          setSession(null);
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
