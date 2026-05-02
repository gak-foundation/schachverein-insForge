import { z } from "zod";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("Muss eine gültige URL sein").optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // InsForge
  NEXT_PUBLIC_INSFORGE_URL: z.string().url().default("https://4d3rbpyx.eu-central.insforge.app"),
  NEXT_PUBLIC_INSFORGE_ANON_KEY: z.string().optional(),
  INSFORGE_SERVICE_ROLE_KEY: z.string().optional(),
  // Optional: Email SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // Encryption for sensitive data
  ENCRYPTION_KEY: z.string().optional(),
  BBP_PAIRINGS_CONTAINER: z.string().default("schachverein-pairings"),
  BBP_TEMP_DIR: z.string().default("/tmp/bbp-pairings"),
});

// Parsen der Umgebungsvariablen. Wirft einen Fehler (mit Exit Code 1), wenn etwas fehlt.
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_INSFORGE_URL: process.env.NEXT_PUBLIC_INSFORGE_URL ?? "https://4d3rbpyx.eu-central.insforge.app",
  NEXT_PUBLIC_INSFORGE_ANON_KEY: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  INSFORGE_SERVICE_ROLE_KEY: process.env.INSFORGE_SERVICE_ROLE_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  BBP_PAIRINGS_CONTAINER: process.env.BBP_PAIRINGS_CONTAINER,
  BBP_TEMP_DIR: process.env.BBP_TEMP_DIR,
};

const _env = envSchema.safeParse(processEnv);

if (!_env.success) {
  console.error("❌ Ungültige Umgebungsvariablen:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
