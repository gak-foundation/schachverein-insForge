import "dotenv/config";
import { createServiceClient } from "@/lib/insforge";

// Seed script - creates admin member
// Note: User accounts should be created via Better Auth API or sign-up flow
// After running this, use the "Forgot Password" feature to set admin password

async function seed() {
  const client = createServiceClient();
  console.log("Seeding database...");
  console.log("Database URL:", process.env.DATABASE_URL?.replace(/:.*@/, ":*****@"));

  // Check if admin member already exists
  const { data: existingMember, error: lookupError } = await client
    .from("members")
    .select("*")
    .eq("email", "admin@schachverein.de")
    .maybeSingle();

  if (lookupError) {
    console.error("Error looking up member:", lookupError);
    process.exit(1);
  }

  if (existingMember) {
    console.log("Admin member already exists.");
    process.exit(0);
  }

  // Create admin member first
  const { data: member, error: insertError } = await client
    .from("members")
    .insert([
      {
        first_name: "Admin",
        last_name: "User",
        email: "admin@schachverein.de",
        role: "admin",
        status: "active",
      },
    ])
    .select()
    .single();

  if (insertError || !member) {
    console.error("Failed to create admin member:", insertError);
    process.exit(1);
  }

  console.log("✅ Admin member created successfully!");
  console.log("   Email: admin@schachverein.de");
  console.log("   Member ID:", member.id);
  console.log("");
  console.log("   To create a user account:");
  console.log("   1. Go to /signup and register with admin@schachverein.de");
  console.log("   2. Manually set memberId in auth_user table to:", member.id);
  console.log("   3. Update role to 'admin' in the database");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
