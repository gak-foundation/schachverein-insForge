import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../../env";
import { logger } from "../logger";

const runMigrate = async () => {
  logger.info("🚀 Starte Datenbank-Migrationen...");
  
  if (!env.DATABASE_URL) {
    logger.error("❌ DATABASE_URL fehlt.");
    process.exit(1);
  }

  // Für Migrationen reicht max 1 Connection
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    logger.info("✅ Migrationen erfolgreich abgeschlossen.");
  } catch (error) {
    logger.error(error as Error, "❌ Fehler bei der Migration:");
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
};

runMigrate();
