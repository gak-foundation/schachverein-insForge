import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { db } from "../src/lib/db";
import { authUsers, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  console.log("🚀 Initialisiere Supabase Admin Client...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("🔍 Suche Admin-Mitglied...");
  const member = await db.query.members.findFirst({
    where: eq(members.email, "admin@schachverein.de"),
  });

  if (!member) {
    console.error("❌ Admin-Mitglied nicht gefunden. Bitte zuerst 'npm run db:seed' ausführen.");
    process.exit(1);
  }

  const email = "admin@schachverein.de";
  const password = "admin123";

  console.log(`🔍 Prüfe ob User ${email} in Supabase existiert...`);
  
  // List users to find by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("❌ Fehler beim Abrufen der User:", listError);
    process.exit(1);
  }

  let authUser = users.find(u => u.email === email);

  if (!authUser) {
    console.log("➕ Erstelle neuen Supabase Auth User...");
    const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Admin User" }
    });

    if (createError || !newUser) {
      console.error("❌ Fehler beim Erstellen des Auth Users:", createError);
      process.exit(1);
    }
    authUser = newUser;
  } else {
    console.log("✅ Supabase Auth User existiert bereits.");
  }

  console.log("🔄 Aktualisiere Profil in der Datenbank (auth_user)...");
  
  const existingProfile = await db.query.authUsers.findFirst({
    where: eq(authUsers.id, authUser.id),
  });

  if (existingProfile) {
    await db.update(authUsers)
      .set({
        role: "admin",
        isSuperAdmin: true,
        memberId: member.id,
        updatedAt: new Date(),
      })
      .where(eq(authUsers.id, authUser.id));
  } else {
    await db.insert(authUsers).values({
      id: authUser.id,
      name: "Admin User",
      email: email,
      emailVerified: true,
      role: "admin",
      isSuperAdmin: true,
      memberId: member.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
