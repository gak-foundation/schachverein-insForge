import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { db } from "../src/lib/db";
import { authUsers, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Script zum Erstellen oder Aktualisieren eines Super-Admins.
 * Verwendung: npx tsx scripts/setup-super-admin.ts <email> <passwort> <name>
 */

async function setupSuperAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || "admin@schachverein.de";
  const password = args[1] || "admin123";
  const name = args[2] || "Super Admin";

  console.log("🚀 Initialisiere Supabase Admin Client...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  console.log(`🔍 Prüfe ob User ${email} in Supabase Auth existiert...`);
  
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
      user_metadata: { full_name: name }
    });

    if (createError || !newUser) {
      console.error("❌ Fehler beim Erstellen des Auth Users:", createError);
      process.exit(1);
    }
    authUser = newUser;
  } else {
    console.log("✅ Supabase Auth User existiert bereits. Aktualisiere Passwort...");
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: password
    });
    if (updateAuthError) {
      console.error("❌ Fehler beim Aktualisieren des Passworts:", updateAuthError);
    }
  }

  console.log("🔄 Synchronisiere auth_user Tabelle...");
  
  const existingProfile = await db.query.authUsers.findFirst({
    where: eq(authUsers.id, authUser.id),
  });

  if (existingProfile) {
    console.log("Updating existing profile...");
    await db.update(authUsers)
      .set({
        name: name,
        email: email,
        role: "admin",
        isSuperAdmin: true,
        memberId: member.id,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(authUsers.id, authUser.id));
  } else {
    console.log("Inserting new profile...");
    await db.insert(authUsers).values({
      id: authUser.id,
      name: name,
      email: email,
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
