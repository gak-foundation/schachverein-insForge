import { test, expect } from "@playwright/test";

/**
 * E2E-Tests für den kritischen Flow:
 * "Mitglied anlegen → Einladung senden → Login → Dashboard"
 *
 * Hinweis zum vollständigen Flow:
 * Der End-to-End-Flow über die echte InsForge-Authentifizierung ist als
 * test.fixme markiert. Gründe:
 *
 * 1. InsForge Auth-System: Die Authentifizierung läuft über das externe
 *    InsForge Auth-System (nicht nur die lokale `auth_user`-Tabelle).
 *    Ein per REST/DB eingefügter User funktioniert nicht für `signInWithPassword`.
 *
 * 2. Registrierung in Playwright: Die Registrierung über die UI scheitert
 *    aktuell daran, dass `useActionState` + Server Action in Playwright
 *    unter React 19 / Next.js 16 nicht korrekt auslöst (keine Navigation
 *    nach Form-Submit).
 *
 * 3. E-Mail-Verifikation: Selbst wenn die Registrierung funktionierte,
 *    erfordert InsForge eine E-Mail-Verifikation. Der Dev-Mode Auto-Verify
 *    ist verfügbar, aber die Navigation dorthin findet nicht statt.
 *
 * Lösungsmöglichkeiten für die Zukunft:
 * - Einen InsForge Edge Function Endpunkt erstellen, der per Service Key
 *   einen verifizierten Auth-User direkt im InsForge-System anlegt.
 * - Oder: Die E-Mail-Verifikation im Dev-Modus komplett deaktivieren.
 * - Oder: Einen Test-Admin manuell über die UI anlegen und dessen
 *   Credentials in `.env.local` hinterlegen.
 */

test.describe("Kritischer Flow: Mitglied anlegen -> Einladung senden -> Login -> Dashboard", () => {
  test("sollte alle kritischen Seiten und Formulare anzeigen", async ({ page }) => {
    // Login-Seite ist erreichbar
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /Willkommen zuruck/i })).toBeVisible();
    await expect(page.getByPlaceholder(/name@verein.de/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ihr Passwort/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Anmelden/i })).toBeVisible();

    // Signup-Seite ist erreichbar
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: /Konto erstellen/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Ihr Name/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Konto erstellen/i })).toBeVisible();

    // Geschützte Seiten leiten nicht eingeloggte User zum Login um
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.goto("/dashboard/members/new");
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.goto("/dashboard/einladungen");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test.fixme(
    "sollte den kompletten Flow über Registrierung und Onboarding durchführen",
    async () => {
      // Siehe Dokumentation oben. Aktivierung erfordert:
      // 1. Einen verifizierten Test-Admin im InsForge Auth-System
      // 2. Oder deaktivierte E-Mail-Verifikation im Dev-Modus
      // 3. Oder einen funktionierenden Playwright-Form-Submit für React 19 Server Actions
    }
  );
});
