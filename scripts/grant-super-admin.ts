import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createServiceClient } from "@/lib/insforge";

/**
 * Script zum Vergeben von Super-Admin-Rechten an einen existierenden Nutzer.
 * Verwendung: npx tsx scripts/grant-super-admin.ts <email>
 */

async function grantSuperAdmin() {
  const client = createServiceClient();
  const args = process.argv.slice(2);
  const email = args[0];

  if (!email) {
    console.error("❌ Bitte eine E-Mail-Adresse angeben.");
    console.error("   Verwendung: npx tsx scripts/grant-super-admin.ts <email>");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL fehlt in der Umgebungskonfiguration.");
    process.exit(1);
  }

  console.log(`🔍 Suche Nutzer mit E-Mail: ${email} ...`);

  const { data: user, error } = await client
    .from("auth_user")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error(`❌ Fehler beim Suchen des Nutzers:`, error);
    process.exit(1);
  }

  if (!user) {
    console.error(`❌ Kein registrierter Nutzer mit E-Mail ${email} gefunden.`);
    console.error("   Der Nutzer muss sich zuerst anmelden oder registriert sein.");
    process.exit(1);
  }

  if (user.is_super_admin && user.role === "admin") {
    console.log(`ℹ️  Nutzer ${email} hat bereits Super-Admin-Rechte.`);
    process.exit(0);
  }

  console.log(`🔄 Aktualisiere Nutzer ${email} ...`);

  const { error: updateError } = await client
    .from("auth_user")
    .update({
      role: "admin",
      is_super_admin: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("❌ Fehler beim Aktualisieren des Nutzers:", updateError);
    process.exit(1);
  }

  console.log("\n✨ Super-Admin-Rechte erfolgreich vergeben!");
  console.log(`📧 E-Mail:     ${email}`);
  console.log(`🛡️  isSuperAdmin: true`);
  console.log(`👤 Rolle:      admin`);

  process.exit(0);
}

grantSuperAdmin().catch((error) => {
  console.error("❌ Fehler:", error);
  process.exit(1);
});
