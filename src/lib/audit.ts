"use server";

import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
}) {
  const session = await auth();
  await db.insert(auditLog).values({
    userId: session?.user?.id ?? null,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId ?? undefined,
    changes: params.changes ?? null,
    ipAddress: params.ipAddress ?? null,
  });
}