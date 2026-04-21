"use server";

import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { success: false, error: error.message || "Passwort-Zurücksetzen fehlgeschlagen" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Ein Fehler ist aufgetreten" };
  }
}
