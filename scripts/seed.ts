import "dotenv/config";
import { db } from "../src/lib/db";
import { users, members } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  console.log("Database URL:", process.env.DATABASE_URL?.replace(/:.*@/, ":*****@"));

  // Check if admin already exists
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, "admin@schachverein.de"),
  });

  if (existingAdmin) {
    console.log("Admin user already exists.");
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

  // Create admin user
  const passwordHash = await hashPassword("admin123");

  await db.insert(users).values({
    name: "Admin User",
    email: "admin@schachverein.de",
    passwordHash,
    role: "admin",
    memberId: member.id,
    emailVerified: new Date(),
  });

  console.log("✅ Admin user created successfully!");
  console.log("   Email: admin@schachverein.de");
  console.log("   Password: admin123");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
