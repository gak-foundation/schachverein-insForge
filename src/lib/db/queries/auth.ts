import { eq, desc } from "drizzle-orm";
import { authUsers } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function getAuthUserById(id: string) {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id)).limit(1);
    return user ?? null;
}

export async function getAuthUserWithClub(id: string) {
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
        
        console.error("❌ Drizzle getAuthUserWithClub failed:", {
            message: errorMessage,
            cause: error.cause?.message,
            code: error.code || error.cause?.code,
            isPoolerError
        });

        if (isPoolerError) {
            console.warn("⚠️ Supabase Pooler Error: Bitte prüfe ob das Projekt pausiert ist oder die DATABASE_URL korrekt ist.");
        }

        console.info("🔄 Falling back to Supabase REST API (Service Role)...");

        try {
            const supabase = createServiceClient();
            const { data, error: restError } = await supabase
                .from('auth_user')
                .select('id, name, email, email_verified, image, role, permissions, member_id, club_id, is_super_admin')
                .eq('id', id)
                .single();

            if (restError || !data) {
                console.error("REST API fallback for auth_user also failed:", restError?.message || "No data found");
                throw error;
            }

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
        } catch (fallbackError: any) {
            console.error("Fallback execution failed:", fallbackError.message);
            throw error;
        }
    }
}

export async function getAllAuthUsers() {
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
        console.error("❌ Drizzle getAllAuthUsers failed:", {
            message: errorMessage,
            cause: error.cause?.message,
            code: error.code || error.cause?.code
        });
        
        console.info("🔄 Falling back to Supabase REST API (Service Role)...");

        try {
            const supabase = createServiceClient();
            const { data, error: restError } = await supabase
                .from('auth_user')
                .select('id, name, email, role, is_super_admin, created_at, updated_at')
                .order('created_at', { ascending: false });

            if (restError) {
                console.error("REST API fallback for auth_user also failed:", restError.message);
                throw error;
            }

            return (data || []).map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                isSuperAdmin: u.is_super_admin || false,
                createdAt: u.created_at,
                lastLoginAt: u.updated_at,
            }));
        } catch (fallbackError) {
            throw error;
        }
    }
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
