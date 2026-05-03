import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { authUsers, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Script zum Erstellen oder Aktualisieren eines Super-Admins.
 * Verwendung: npx tsx scripts/setup-super-admin.ts <email> <passwort> <name>
 */

async function setupSuperAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || "admin@schachverein.de";
  const password = args[1] || "admin123";
  const name = args[2] || "Super Admin";

  console.log("🚀 Initialisiere InsForge Admin Setup...");

  console.log(`🔍 Prüfe ob Mitglied mit Email ${email} existiert...`);
  let member = await db.query.members.findFirst({
    where: eq(members.email, email),
  });

  if (!member) {
    console.log(`➕ Erstelle neues Mitglied für ${email}...`);
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    const [newMember] = await db.insert(members).values({
      firstName,
      lastName,
      email,
      role: "admin",
      status: "active",
    }).returning();
    member = newMember;
  }

  console.log("🔄 Synchronisiere auth_user Tabelle...");
  
  const existingProfile = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, email),
  });

  if (existingProfile) {
    console.log("Updating existing profile...");
    await db.update(authUsers)
      .set({
        name: name,
        password: password,
        role: "admin",
        isSuperAdmin: true,
        memberId: member.id,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(authUsers.id, existingProfile.id));
  } else {
    console.log("Inserting new profile...");
    await db.insert(authUsers).values({
      id: uuidv4(),
      name: name,
      email: email,
      password: password,
      emailVerified: true,
      role: "admin",
      isSuperAdmin: true,
      memberId: member.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
