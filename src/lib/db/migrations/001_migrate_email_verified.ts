import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { logAudit } from "@/lib/audit";

/**
 * Migration: Bestehende Nutzer mit passwordHash erhalten emailVerified = NOW()
 * 
 * Problem: Vor Einführung der E-Mail-Verifikation hatten alle Nutzer
 * emailVerified = null. Nach der Einführung der Pflicht können sich diese
 * Nutzer nicht mehr einloggen.
 * 
 * Diese Migration setzt emailVerified für alle bestehenden Nutzer mit
 * einem Passwort-Hash auf das aktuelle Datum.
 */
export async function migrateExistingUsersEmailVerified(): Promise<{ migrated: number }> {
  const result = await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(isNull(users.emailVerified))
    .returning({ id: users.id, email: users.email });

  const migratedCount = result.length;

  if (migratedCount > 0) {
    await logAudit({
      action: "migration",
      entity: "user",
      changes: {
        migration: {
          old: null,
          new: { 
            description: "Set emailVerified for existing users",
            count: migratedCount 
          }
        }
      },
    });
  }

  return { migrated: migratedCount };
}

// Auto-run if this file is executed directly
if (require.main === module) {
  migrateExistingUsersEmailVerified()
    .then(({ migrated }) => {
      console.log(`✅ Migration complete: ${migrated} users updated`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}
