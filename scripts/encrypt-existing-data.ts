import "dotenv/config";
import { createServiceClient } from "@/lib/insforge";
import { encrypt } from "../src/lib/crypto";

async function main() {
  const client = createServiceClient();
  console.log("🔒 Starting encryption migration for existing data...");

  // 1. Members
  const { data: allMembers, error: membersError } = await client
    .from("members")
    .select("id, sepa_iban, sepa_bic");

  if (membersError) {
    console.error("❌ Failed to fetch members:", membersError);
    process.exit(1);
  }

  console.log(`Processing ${allMembers?.length ?? 0} members...`);
  let memberCount = 0;

  for (const member of allMembers || []) {
    let needsUpdate = false;
    const updateData: Record<string, unknown> = {};

    if (member.sepa_iban && !member.sepa_iban.includes(":")) {
      updateData.sepa_iban = encrypt(member.sepa_iban);
      needsUpdate = true;
    }

    if (member.sepa_bic && !member.sepa_bic.includes(":")) {
      updateData.sepa_bic = encrypt(member.sepa_bic);
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateError } = await client
        .from("members")
        .update(updateData)
        .eq("id", member.id);

      if (updateError) {
        console.error(`❌ Failed to update member ${member.id}:`, updateError);
      } else {
        memberCount++;
      }
    }
  }
  console.log(`✅ Updated ${memberCount} members.`);

  // 2. Clubs
  const { data: allClubs, error: clubsError } = await client
    .from("clubs")
    .select("id, sepa_iban, sepa_bic");

  if (clubsError) {
    console.error("❌ Failed to fetch clubs:", clubsError);
    process.exit(1);
  }

  console.log(`Processing ${allClubs?.length ?? 0} clubs...`);
  let clubCount = 0;

  for (const club of allClubs || []) {
    let needsUpdate = false;
    const updateData: Record<string, unknown> = {};

    if (club.sepa_iban && !club.sepa_iban.includes(":")) {
      updateData.sepa_iban = encrypt(club.sepa_iban);
      needsUpdate = true;
    }

    if (club.sepa_bic && !club.sepa_bic.includes(":")) {
      updateData.sepa_bic = encrypt(club.sepa_bic);
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: updateError } = await client
        .from("clubs")
        .update(updateData)
        .eq("id", club.id);

      if (updateError) {
        console.error(`❌ Failed to update club ${club.id}:`, updateError);
      } else {
        clubCount++;
      }
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
