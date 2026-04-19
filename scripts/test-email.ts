import path from "path";
import { config } from "dotenv";

// Lade .env explizit aus dem Wurzelverzeichnis und überschreibe vorhandene Variablen
const result = config({ 
  path: path.resolve(process.cwd(), ".env"),
  override: true 
});

if (result.error) {
  console.error("Fehler beim Laden der .env Datei:", result.error);
}

import { sendEmailDirect } from "../src/lib/auth/email";

async function main() {
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error("Bitte gib eine E-Mail-Adresse als Argument an: npx tsx scripts/test-email.ts dein@email.de");
    process.exit(1);
  }

  console.log("Konfiguration wird geprüft...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST || "Nicht gesetzt");
  console.log("SMTP_USER:", process.env.SMTP_USER || "Nicht gesetzt");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Gesetzt (wird nicht angezeigt)" : "Nicht gesetzt");

  console.log(`\nVersende Test-E-Mail an ${testEmail}...`);
  try {
    await sendEmailDirect(
      testEmail,
      "Test-E-Mail vom Schachverein",
      "<h1>Erfolg!</h1><p>Die SMTP-Anbindung an Brevo funktioniert einwandfrei.</p>",
      "Erfolg! Die SMTP-Anbindung an Brevo funktioniert einwandfrei."
    );
    console.log("E-Mail erfolgreich versendet!");
  } catch (error) {
    console.error("Fehler beim E-Mail-Versand:", error);
  }
}

main();
