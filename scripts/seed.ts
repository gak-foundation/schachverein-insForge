import "dotenv/config";
import { db } from "../src/lib/db";
import { authUsers, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// Seed script - creates admin member
// Note: User accounts should be created via Better Auth API or sign-up flow
// After running this, use the "Forgot Password" feature to set admin password

async function seed() {
  console.log("Seeding database...");
  console.log("Database URL:", process.env.DATABASE_URL?.replace(/:.*@/, ":*****@"));

  // Check if admin member already exists
  const existingMember = await db.query.members.findFirst({
    where: eq(members.email, "admin@schachverein.de"),
  });

  if (existingMember) {
    console.log("Admin member already exists.");
    process.exit(0);
  }

  // Create admin member first
  const [member] = await db
    .insert(members)
    .values({
      firstName: "Admin",
      lastName: "User",
      email: "admin@schachverein.de",
      role: "admin",
      status: "active",
    })
    .returning();

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
