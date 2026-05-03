import "dotenv/config";
import { db } from "../src/lib/db";
import { authUsers, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function createAdmin() {
  console.log("🚀 Initialisiere InsForge Admin Setup...");

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

  console.log(`🔍 Prüfe ob User ${email} in auth_user existiert...`);
  
  let existingProfile = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, email),
  });

  if (existingProfile) {
    console.log("🔄 Aktualisiere Profil in der Datenbank (auth_user)...");
    await db.update(authUsers)
      .set({
        role: "admin",
        isSuperAdmin: true,
        memberId: member.id,
        password: password,
        updatedAt: new Date(),
      })
      .where(eq(authUsers.id, existingProfile.id));
  } else {
    console.log("➕ Erstelle neues Profil in der Datenbank (auth_user)...");
    await db.insert(authUsers).values({
      id: uuidv4(),
      name: "Admin User",
      email: email,
      emailVerified: true,
      password: password,
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
