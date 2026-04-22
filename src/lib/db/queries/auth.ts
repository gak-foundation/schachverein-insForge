import { db } from "@/lib/db";
import { authUsers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAuthUserById(id: string) {
  const [user] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.id, id))
    .limit(1);

  return user ?? null;
}

export async function getAuthUserWithClub(id: string) {
  const [user] = await db
    .select({
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
      emailVerified: authUsers.emailVerified,
      image: authUsers.image,
      role: authUsers.role,
      permissions: authUsers.permissions,
      memberId: authUsers.memberId,
      activeClubId: authUsers.activeClubId,
      isSuperAdmin: authUsers.isSuperAdmin,
    })
    .from(authUsers)
    .where(eq(authUsers.id, id))
    .limit(1);

  return user ?? null;
}

export async function getAllAuthUsers() {
  return db
    .select({
      id: authUsers.id,
      name: authUsers.name,
      email: authUsers.email,
      role: authUsers.role,
      isSuperAdmin: authUsers.isSuperAdmin,
      createdAt: authUsers.createdAt,
      lastLoginAt: authUsers.updatedAt,
    })
    .from(authUsers)
    .orderBy(desc(authUsers.createdAt));
}

export async function updateAuthUser(
  id: string,
  data: Partial<typeof authUsers.$inferInsert>
) {
  const [updated] = await db
    .update(authUsers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(authUsers.id, id))
    .returning();

  return updated ?? null;
}
