import "dotenv/config";
import { db } from "../src/lib/db";
import { members, clubs } from "../src/lib/db/schema";
import { encrypt } from "../src/lib/crypto";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔒 Starting encryption migration for existing data...");

  // 1. Members
  const allMembers = await db.select({
    id: members.id,
    sepaIban: members.sepaIban,
    sepaBic: members.sepaBic,
  }).from(members);

  console.log(`Processing ${allMembers.length} members...`);
  let memberCount = 0;

  for (const member of allMembers) {
    let needsUpdate = false;
    const updateData: Record<string, unknown> = {};

    // If it's already encrypted, decrypt() returns it as is (due to missing colons)
    // or fails and returns as is. The encrypt() function always adds colons.
    
    if (member.sepaIban && !member.sepaIban.includes(":")) {
      updateData.sepaIban = encrypt(member.sepaIban);
      needsUpdate = true;
    }

    if (member.sepaBic && !member.sepaBic.includes(":")) {
      updateData.sepaBic = encrypt(member.sepaBic);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await db.update(members).set(updateData).where(sql`${members.id} = ${member.id}`);
      memberCount++;
    }
  }
  console.log(`✅ Updated ${memberCount} members.`);

  // 2. Clubs
  const allClubs = await db.select({
    id: clubs.id,
    sepaIban: clubs.sepaIban,
    sepaBic: clubs.sepaBic,
  }).from(clubs);

  console.log(`Processing ${allClubs.length} clubs...`);
  let clubCount = 0;

  for (const club of allClubs) {
    let needsUpdate = false;
    const updateData: Record<string, unknown> = {};

    if (club.sepaIban && !club.sepaIban.includes(":")) {
      updateData.sepaIban = encrypt(club.sepaIban);
      needsUpdate = true;
    }

    if (club.sepaBic && !club.sepaBic.includes(":")) {
      updateData.sepaBic = encrypt(club.sepaBic);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await db.update(clubs).set(updateData).where(sql`${clubs.id} = ${club.id}`);
      clubCount++;
    }
  }
  console.log(`✅ Updated ${clubCount} clubs.`);
  
  console.log("🏁 Encryption migration finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
