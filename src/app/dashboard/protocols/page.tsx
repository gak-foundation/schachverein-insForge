import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAuditLogs } from "@/features/audit/actions";
import { ProtocolsPageClient } from "./protocols-page-client";

export const metadata = {
  title: "Protokolle",
};

export default async function ProtocolsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.ADMIN_AUDIT, session.user.isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Audit-Protokolle.</p>
      </div>
    );
  }

  const logs = await getAuditLogs();

  return <ProtocolsPageClient logs={logs} />;
}
