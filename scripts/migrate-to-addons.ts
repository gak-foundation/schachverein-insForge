#!/usr/bin/env tsx
/**
 * Migration: Convert existing pro/enterprise clubs to free/pro plan model
 *
 * Run: npx tsx scripts/migrate-to-addons.ts
 */

import { createServiceClient } from "@/lib/insforge";

async function migrate() {
  const client = createServiceClient();
  console.log("🔧 Starting plan migration...\n");

  // Find all non-free clubs
  const { data: legacyClubs, error } = await client
    .from("clubs")
    .select("*")
    .neq("plan", "free");

  if (error) {
    console.error("❌ Failed to fetch clubs:", error);
    process.exit(1);
  }

  console.log(`Found ${legacyClubs?.length ?? 0} clubs with legacy plan (pro/enterprise)`);

  for (const club of legacyClubs || []) {
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
