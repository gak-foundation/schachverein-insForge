"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/insforge";
import { setAuthCookies, clearAuthCookies } from "@/lib/insforge/server-auth";
import { ensureAuthUser, getAuthUserWithClub } from "@/lib/db/queries/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string || "/dashboard";

  if (!email || !password) {
    return { error: "E-Mail und Passwort sind erforderlich" };
  }

  try {
    const client = createServerClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("credential") || lower.includes("passwort") || lower.includes("invalid")) {
        return { error: "Ungültige E-Mail oder Passwort" };
      }
      if (lower.includes("email") && (lower.includes("confirmed") || lower.includes("verif"))) {
        return { error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse" };
      }
      return { error: error.message };
    }

    if (!data?.accessToken || !data?.refreshToken) {
      return { error: "Anmeldung fehlgeschlagen" };
    }

    await setAuthCookies(data.accessToken, data.refreshToken);

    const user = data.user;
    if (user) {
      await ensureAuthUser({
        id: user.id,
        email: user.email,
        name: user.profile?.name || user.email?.split("@")[0],
        emailVerified: user.emailVerified ?? false,
      });

      const userData = await getAuthUserWithClub(user.id);
      if (userData && !userData.clubId && redirectTo === "/dashboard") {
        redirect("/onboarding");
      }
    }

    redirect(redirectTo);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: "Ein Fehler ist aufgetreten" };
  }
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "E-Mail und Passwort sind erforderlich" };
  }

  if (password.length < 8) {
    return { error: "Passwort muss mindestens 8 Zeichen haben" };
  }

  try {
    const client = createServerClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      name: name || email.split("@")[0],
    });

    if (error) {
      return { error: error.message || "Registrierung fehlgeschlagen" };
    }

    if (data?.user) {
      await ensureAuthUser({
        id: data.user.id,
        email: data.user.email,
        name: name || email.split("@")[0],
        emailVerified: data.user.emailVerified ?? false,
      });
    }

    const emailParam = encodeURIComponent(email);
    if (data?.requireEmailVerification) {
      redirect(`/auth/verify-email?email=${emailParam}&dev=${!process.env.SMTP_HOST}`);
    }

    if (data?.accessToken && data?.refreshToken) {
      await setAuthCookies(data.accessToken, data.refreshToken);
    }

    redirect("/auth/verify-email");
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: "Ein Fehler ist aufgetreten" };
  }
}

export async function verifyEmailAction(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  if (!email || !code) {
    return { error: "E-Mail und Code sind erforderlich" };
  }

  try {
    const client = createServerClient();
    const { data, error } = await client.auth.verifyEmail({ email, otp: code });

    if (error) {
      return { error: error.message || "Verifizierung fehlgeschlagen" };
    }

    if (!data) {
      return { error: "Verifizierung fehlgeschlagen" };
    }

    if (data.accessToken) {
      await setAuthCookies(data.accessToken, (data as any).refreshToken || "");
    }

    await ensureAuthUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.email?.split("@")[0],
      emailVerified: true,
    });

    return { success: true };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { error: "Ein Fehler ist aufgetreten" };
  }
}

export async function logoutAction() {
  try {
    const client = createServerClient();
    await clearAuthCookies();
    await client.auth.signOut();
  } catch {
    // Even if SDK signOut fails, clear cookies
    await clearAuthCookies();
  }
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password) {
    return { success: false, error: "Passwort ist erforderlich" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwörter stimmen nicht überein" };
  }

  if (password.length < 8) {
    return { success: false, error: "Passwort muss mindestens 8 Zeichen haben" };
  }

  try {
    const client = createServerClient();
    const { error } = await client.auth.resetPassword({
      newPassword: password,
      otp: formData.get("token") as string || "",
    });

    if (error) {
      return { success: false, error: error.message || "Passwort-Zurücksetzen fehlgeschlagen" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Ein Fehler ist aufgetreten" };
  }
}