import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createServiceClient } from "@/lib/insforge";

/**
 * Script zum Erstellen oder Aktualisieren eines Super-Admins.
 * Verwendung: npx tsx scripts/setup-super-admin.ts <email> <passwort> <name>
 */

async function setupSuperAdmin() {
  const client = createServiceClient();
  const args = process.argv.slice(2);
  const email = args[0] || "admin@schachverein.de";
  const password = args[1] || "admin123";
  const name = args[2] || "Super Admin";

  console.log("🚀 Initialisiere InsForge Admin Setup...");

  console.log(`🔍 Prüfe ob Mitglied mit Email ${email} existiert...`);
  const { data: member, error: memberError } = await client
    .from("members")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (memberError) {
    console.error("❌ Fehler beim Suchen des Mitglieds:", memberError);
    process.exit(1);
  }

  let memberId: string;

  if (!member) {
    console.log(`➕ Erstelle neues Mitglied für ${email}...`);
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    const { data: newMember, error: insertError } = await client
      .from("members")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          role: "admin",
          status: "active",
        },
      ])
      .select()
      .single();

    if (insertError || !newMember) {
      console.error("❌ Fehler beim Erstellen des Mitglieds:", insertError);
      process.exit(1);
    }

    memberId = newMember.id;
  } else {
    memberId = member.id;
  }

  console.log("🔄 Synchronisiere auth_user Tabelle...");

  const { data: existingProfile, error: profileError } = await client
    .from("auth_user")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    console.error("❌ Fehler beim Suchen des Auth-Users:", profileError);
    process.exit(1);
  }

  if (existingProfile) {
    console.log("Updating existing profile...");
    const { error: updateError } = await client
      .from("auth_user")
      .update({
        name: name,
        password: password,
        role: "admin",
        is_super_admin: true,
        member_id: memberId,
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProfile.id);

    if (updateError) {
      console.error("❌ Fehler beim Aktualisieren des Auth-Users:", updateError);
      process.exit(1);
    }
  } else {
    console.log("Inserting new profile...");
    const { error: insertError } = await client.from("auth_user").insert([
      {
        id: uuidv4(),
        name: name,
        email: email,
        password: password,
        email_verified: true,
        role: "admin",
        is_super_admin: true,
        member_id: memberId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("❌ Fehler beim Erstellen des Auth-Users:", insertError);
      process.exit(1);
    }
  }

  console.log("\n✨ Super-Admin erfolgreich eingerichtet!");
  console.log(`📧 E-Mail:  ${email}`);
  console.log(`🔑 Passwort: ${password}`);
  console.log(`👤 Name:     ${name}`);
  console.log(`🛡️ Role:     admin (isSuperAdmin: true)`);

  process.exit(0);
}

setupSuperAdmin().catch((error) => {
  console.error("❌ Schwerwiegender Fehler:", error);
  process.exit(1);
});
