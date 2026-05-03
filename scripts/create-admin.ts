import "dotenv/config";
import { createServiceClient } from "@/lib/insforge";
import { v4 as uuidv4 } from "uuid";

async function createAdmin() {
  const client = createServiceClient();
  console.log("🚀 Initialisiere InsForge Admin Setup...");

  console.log("🔍 Suche Admin-Mitglied...");
  const { data: member, error: memberError } = await client
    .from("members")
    .select("*")
    .eq("email", "admin@schachverein.de")
    .maybeSingle();

  if (memberError) {
    console.error("❌ Fehler beim Suchen des Admin-Mitglieds:", memberError);
    process.exit(1);
  }

  if (!member) {
    console.error("❌ Admin-Mitglied nicht gefunden. Bitte zuerst 'npm run db:seed' ausführen.");
    process.exit(1);
  }

  const email = "admin@schachverein.de";
  const password = "admin123";

  console.log(`🔍 Prüfe ob User ${email} in auth_user existiert...`);

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
    console.log("🔄 Aktualisiere Profil in der Datenbank (auth_user)...");
    const { error: updateError } = await client
      .from("auth_user")
      .update({
        role: "admin",
        is_super_admin: true,
        member_id: member.id,
        password: password,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProfile.id);

    if (updateError) {
      console.error("❌ Fehler beim Aktualisieren des Auth-Users:", updateError);
      process.exit(1);
    }
  } else {
    console.log("➕ Erstelle neues Profil in der Datenbank (auth_user)...");
    const { error: insertError } = await client.from("auth_user").insert([
      {
        id: uuidv4(),
        name: "Admin User",
        email: email,
        email_verified: true,
        password: password,
        role: "admin",
        is_super_admin: true,
        member_id: member.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("❌ Fehler beim Erstellen des Auth-Users:", insertError);
      process.exit(1);
    }
  }

  console.log("✅ Admin-User erfolgreich eingerichtet!");
  console.log(`   E-Mail: ${email}`);
  console.log(`   Passwort: ${password}`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("❌ Fehler:", error);
  process.exit(1);
});
