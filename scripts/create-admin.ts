import "dotenv/config";
import { db } from "../src/lib/db";
import { authUsers, authAccounts, members } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

async function createAdmin() {
  console.log("Creating admin user...");

  // Find the admin member
  const member = await db.query.members.findFirst({
    where: eq(members.email, "admin@schachverein.de"),
  });

  if (!member) {
    console.error("❌ Admin member not found. Run 'npm run db:seed' first.");
    process.exit(1);
  }

  // Check if user already exists
  const existingUser = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, "admin@schachverein.de"),
  });

  if (existingUser) {
    console.log("✅ Admin user already exists.");
    console.log("   Email: admin@schachverein.de");
    console.log("   Password: admin123");
    process.exit(0);
  }

  // Create user ID
  const userId = crypto.randomUUID();
  const now = new Date();

  // Insert user
  await db.insert(authUsers).values({
    id: userId,
    name: "Admin User",
    email: "admin@schachverein.de",
    emailVerified: true,
    role: "admin",
    memberId: member.id,
    createdAt: now,
    updatedAt: now,
  });

  // Hash password
  const passwordHash = await hash("admin123", 10);

  // Insert credentials account
  await db.insert(authAccounts).values({
    id: crypto.randomUUID(),
    userId: userId,
    accountId: userId, // For credentials, accountId is same as userId
    providerId: "credential",
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  console.log("✅ Admin user created successfully!");
  console.log("   Email: admin@schachverein.de");
  console.log("   Password: admin123");
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("❌ Failed:", error);
  process.exit(1);
});
