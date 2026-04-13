"use server";

import { auth } from "@/lib/auth/better-auth";
import { headers } from "next/headers";

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { success: false, error: "Token ist erforderlich" };
  }

  if (!password) {
    return { success: false, error: "Passwort ist erforderlich" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwörter stimmen nicht überein" };
  }

  if (password.length < 8) {
    return { success: false, error: "Passwort muss mindestens 8 Zeichen haben" };
  }

  const headersList = await headers();

  try {
    await auth.api.resetPassword({
      body: { token, newPassword: password },
      headers: headersList,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Passwort-Zurücksetzen fehlgeschlagen" };
  }
}
