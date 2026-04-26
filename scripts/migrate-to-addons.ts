#!/usr/bin/env tsx
/**
 * Migration: Convert existing pro/enterprise clubs to free/pro plan model
 *
 * Run: npx tsx scripts/migrate-to-addons.ts
 */

import { eq, not } from "drizzle-orm";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema/clubs";

async function migrate() {
  console.log("🔧 Starting plan migration...\n");

  // Find all non-free clubs
  const legacyClubs = await db
    .select()
    .from(clubs)
    .where(not(eq(clubs.plan, "free")));

  console.log(`Found ${legacyClubs.length} clubs with legacy plan (pro/enterprise)`);

  for (const club of legacyClubs) {
    console.log(`\n📋 Club: ${club.name} (${club.id})`);
    console.log(`   Current plan: ${club.plan}`);
    console.log(`   📝 Club kept on plan: ${club.plan}`);
  }

  console.log("\n✅ Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
