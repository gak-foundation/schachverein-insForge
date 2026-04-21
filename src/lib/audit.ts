"use server";

import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { headers } from "next/headers";

export type AuditCategory = "AUTH" | "MEMBER" | "FINANCE" | "ADMIN" | "TOURNAMENT" | "SYSTEM";

interface AuditLogParams {
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, { old: unknown; new: unknown }> | Record<string, unknown>;
  ipAddress?: string;
  category?: AuditCategory;
  metadata?: Record<string, unknown>;
}

async function getClientInfo(): Promise<{ ipAddress: string | null; userAgent: string | null }> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip");
    const userAgent = headersList.get("user-agent");
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

function anonymizeIP(ip: string | null): string | null {
  if (!ip) return null;
  if (ip === "unknown") return ip;
  
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":****";
  }
  
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  
  return ip;
}

export async function logAudit(params: AuditLogParams) {
  const session = await getSession();
  const { ipAddress } = await getClientInfo();
  
  await db.insert(auditLog).values({
    userId: session?.user?.id ?? null,
    clubId: session?.user?.activeClubId ?? null,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId ?? null,
    changes: params.changes ?? null,
    ipAddress: anonymizeIP(ipAddress),
  });
}

export async function logAuthAction(
  action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "REGISTER" | "PASSWORD_RESET" | "EMAIL_VERIFIED" | "2FA_ENABLED" | "2FA_DISABLED",
  metadata?: Record<string, unknown>
) {
  await logAudit({
    action,
    entity: "auth",
    category: "AUTH",
    metadata,
  });
}

export async function logMemberAction(
  action: "CREATED" | "UPDATED" | "DELETED" | "INVITED" | "LINKED" | "DELETION_REQUESTED" | "ANONYMIZED",
  memberId: string,
  changes?: Record<string, { old: unknown; new: unknown }> | Record<string, unknown>
) {
  await logAudit({
    action: `MEMBER_${action}`,
    entity: "member",
    entityId: memberId,
    category: "MEMBER",
    changes,
  });
}

export async function logFinanceAction(
  action: "PAYMENT_CREATED" | "PAYMENT_UPDATED" | "PAYMENT_DELETED",
  paymentId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
) {
  await logAudit({
    action,
    entity: "payment",
    entityId: paymentId,
    category: "FINANCE",
    changes,
  });
}

export async function logAdminAction(
  action: "ROLE_CHANGED" | "USER_BANNED" | "USER_UNBANNED" | "SETTINGS_UPDATED",
  entityId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
) {
  await logAudit({
    action,
    entity: "admin",
    entityId,
    category: "ADMIN",
    changes,
  });
}