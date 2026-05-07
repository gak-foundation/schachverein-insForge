"use server";

import { createServiceClient } from "@/lib/insforge";
import { getSession } from "@/lib/auth/session";
import { headers } from "next/headers";

export type AuditCategory = "AUTH" | "MEMBER" | "FINANCE" | "ADMIN" | "TOURNAMENT" | "SYSTEM";

interface AuditLogParams {
  clubId: string;
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

  const { error } = await createServiceClient().from("audit_log").insert([
    {
      user_id: session?.user?.id ?? null,
      club_id: params.clubId,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? null,
      changes: params.changes ?? null,
      ip_address: anonymizeIP(ipAddress),
    },
  ]);

  if (error) {
    console.error("Failed to log audit entry:", error);
  }
}

export async function logAuthAction(
  action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "REGISTER" | "PASSWORD_RESET" | "EMAIL_VERIFIED" | "2FA_ENABLED" | "2FA_DISABLED",
  clubId: string,
  metadata?: Record<string, unknown>
) {
  await logAudit({
    clubId,
    action,
    entity: "auth",
    category: "AUTH",
    metadata,
  });
}

export async function logMemberAction(
  action: "CREATED" | "UPDATED" | "DELETED" | "INVITED" | "LINKED" | "DELETION_REQUESTED" | "ANONYMIZED",
  memberId: string,
  clubId: string,
  changes?: Record<string, { old: unknown; new: unknown }> | Record<string, unknown>
) {
  await logAudit({
    clubId,
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
  clubId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
) {
  await logAudit({
    clubId,
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
  clubId: string,
  changes?: Record<string, { old: unknown; new: unknown }>
) {
  await logAudit({
    clubId,
    action,
    entity: "admin",
    entityId,
    category: "ADMIN",
    changes,
  });
}
