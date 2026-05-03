import { eq, desc } from "drizzle-orm";
import { authUsers } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { createServerClient, createServiceClient } from "@/lib/insforge";

export async function getAuthUserById(id: string) {
    try {
        // Priority: Use InsForge REST API with Service Role to avoid RLS/Pooler issues
        const client = createServiceClient();
        const { data, error } = await client
            .from('auth_user')
            .select('*')
            .eq('id', id)
            .single();

        if (data && !error) {
            return data;
        }
        
        // Fallback: Drizzle (might fail due to RLS if context is missing)
        const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id)).limit(1);
        return user ?? null;
    } catch (error) {
        console.error("Error in getAuthUserById:", error);
        return null;
    }
}

export async function getAuthUserWithClub(id: string) {
    // 1. Try InsForge REST API (Service Role) - fast and bypasses RLS/Pooler issues
    // This is the recommended path for auth_user to avoid "Tenant or user not found"
    try {
        const client = createServiceClient();
        const { data, error: restError } = await client
            .from('auth_user')
            .select('id, name, email, email_verified, image, role, permissions, member_id, club_id, is_super_admin')
            .eq('id', id)
            .single();

        if (data && !restError) {
            return {
                id: data.id,
                name: data.name,
                email: data.email,
                emailVerified: data.email_verified || false,
                image: data.image,
                role: data.role,
                permissions: data.permissions || [],
                memberId: data.member_id,
                clubId: data.club_id,
                isSuperAdmin: data.is_super_admin || false,
            };
        }
    } catch (restError: any) {
        // Silent fail, try Drizzle
    }

    // 2. Fallback to Drizzle
    try {
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
                clubId: authUsers.clubId,
                isSuperAdmin: authUsers.isSuperAdmin,
            })
            .from(authUsers)
            .where(eq(authUsers.id, id))
            .limit(1);

        return user ?? null;
    } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        const isPoolerError = errorMessage.includes("Tenant or user not found") || error.cause?.message?.includes("Tenant or user not found");
        
        if (isPoolerError) {
            // Already tried REST, so this is a genuine failure
            console.error("❌ Both REST and Drizzle failed for getAuthUserWithClub:", errorMessage);
        }

        return null;
    }
}

export async function getAllAuthUsers() {
    // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
    try {
        const client = createServiceClient();
        const { data, error: restError } = await client
            .from('auth_user')
            .select('id, name, email, role, is_super_admin, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (!restError && data) {
            return data.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                isSuperAdmin: u.is_super_admin || false,
                createdAt: u.created_at,
                lastLoginAt: u.updated_at,
            }));
        }
    } catch (restError) {
        // Silent fail, try Drizzle
    }

    // 2. Fallback to Drizzle
    try {
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
    } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        console.error("❌ Both REST and Drizzle failed for getAllAuthUsers:", errorMessage);
        return [];
    }
}

export async function updateAuthUser(
    id: string,
    data: Partial<typeof authUsers.$inferInsert>
) {
    try {
        // 1. Try InsForge REST API (Service Role) - avoids RLS/Pooler issues
        const client = createServiceClient();
        
        // Convert camelCase keys to snake_case for InsForge REST
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.permissions !== undefined) updateData.permissions = data.permissions;
        if (data.memberId !== undefined) updateData.member_id = data.memberId;
        if (data.clubId !== undefined) updateData.club_id = data.clubId;
        if (data.isSuperAdmin !== undefined) updateData.is_super_admin = data.isSuperAdmin;

        const { data: updated, error } = await client
            .from('auth_user')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updated && !error) {
            return {
                ...updated,
                emailVerified: updated.email_verified,
                memberId: updated.member_id,
                clubId: updated.club_id,
                isSuperAdmin: updated.is_super_admin,
                createdAt: updated.created_at,
                updatedAt: updated.updated_at,
            };
        }
    } catch (error) {
        // Silent fail, try Drizzle
    }

    // 2. Fallback to Drizzle
    const [updated] = await db
        .update(authUsers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(authUsers.id, id))
        .returning();

    return updated ?? null;
}

/**
 * Programmatic user sync — replaces the DB trigger.
 * Creates or updates a record in public.auth_user whenever a user authenticates.
 * Called from signup, OAuth callback, and tenant verification.
 */
export async function ensureAuthUser(userData: {
    id: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    emailVerified?: boolean;
    clubId?: string;
}) {
    try {
        // Try InsForge REST API first
        const client = createServiceClient();
        const { data: existing, error: lookupError } = await client
            .from('auth_user')
            .select('id')
            .eq('id', userData.id)
            .maybeSingle();

        if (!lookupError && existing) {
            // Update existing record
            const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
            if (userData.email) updateData.email = userData.email;
            if (userData.name) updateData.name = userData.name;
            if (userData.avatarUrl) updateData.image = userData.avatarUrl;
            if (userData.emailVerified !== undefined) updateData.email_verified = userData.emailVerified;
            if (userData.clubId) updateData.club_id = userData.clubId;

            const { data: updated, error: updateError } = await client
                .from('auth_user')
                .update(updateData)
                .eq('id', userData.id)
                .select()
                .single();

            if (updated && !updateError) return updated;
        } else if (!lookupError) {
            // Insert new record
            const { data: created, error: insertError } = await client
                .from('auth_user')
                .insert([{
                    id: userData.id,
                    email: userData.email,
                    name: userData.name || userData.email?.split('@')[0],
                    image: userData.avatarUrl,
                    email_verified: userData.emailVerified ?? false,
                    role: 'mitglied',
                    club_id: userData.clubId,
                }])
                .select()
                .single();

            if (created && !insertError) return created;
        }
    } catch {
        // Fall through to Drizzle
    }

    // Drizzle fallback
    try {
        const existing = await db.select({ id: authUsers.id })
            .from(authUsers)
            .where(eq(authUsers.id, userData.id))
            .limit(1);

        if (existing.length > 0) {
            const [updated] = await db
                .update(authUsers)
                .set({
                    email: userData.email,
                    name: userData.name,
                    image: userData.avatarUrl,
                    emailVerified: userData.emailVerified,
                    clubId: userData.clubId,
                    updatedAt: new Date(),
                })
                .where(eq(authUsers.id, userData.id))
                .returning();
            return updated;
        }

        const [created] = await db
            .insert(authUsers)
            .values({
                id: userData.id,
                email: userData.email ?? '',
                name: userData.name || userData.email?.split('@')[0],
                image: userData.avatarUrl,
                emailVerified: userData.emailVerified ?? false,
                role: 'mitglied' as any,
                clubId: userData.clubId ?? null as any,
            })
            .returning();
        return created;
    } catch (e) {
        console.error('ensureAuthUser Drizzle fallback failed:', e);
        return null;
    }
}
