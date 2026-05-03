export const auditLog = "audit_log" as const;

export interface AuditLog {
  id: string;
  clubId: string | null;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface NewAuditLog {
  id?: string;
  clubId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt?: string;
}
