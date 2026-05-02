import { eq, desc } from "drizzle-orm";
import { authUsers } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { createServerClient, createServiceClient } from "@/lib/insforge";

export async function getAuthUserById(id: string) {
    try {
        // Priority: Use Supabase REST API with Service Role to avoid RLS/Pooler issues
        const supabase = createServiceClient();
        const { data, error } = await supabase
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
    // 1. Try Supabase REST API (Service Role) - fast and bypasses RLS/Pooler issues
    // This is the recommended path for auth_user to avoid "Tenant or user not found"
    try {
        const supabase = createServiceClient();
        const { data, error: restError } = await supabase
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
    // 1. Try Supabase REST API (Service Role) - avoids RLS/Pooler issues
    try {
        const supabase = createServiceClient();
        const { data, error: restError } = await supabase
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
        // 1. Try Supabase REST API (Service Role) - avoids RLS/Pooler issues
        const supabase = createServiceClient();
        
        // Convert camelCase keys to snake_case for Supabase REST
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

        const { data: updated, error } = await supabase
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
