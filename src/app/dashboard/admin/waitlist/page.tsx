import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { waitlistApplications } from "@/lib/db/schema";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Suspense } from "react";
import { WaitlistActions } from "./waitlist-actions";
import { Clock, CheckCircle2, XCircle, Users, Rocket } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Ausstehend",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 ring-yellow-600/20",
  },
  approved: {
    label: "Genehmigt",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 ring-green-600/20",
  },
  rejected: {
    label: "Abgelehnt",
    icon: XCircle,
    className: "bg-red-100 text-red-700 ring-red-600/20",
  },
  waitlisted: {
    label: "Auf Warteliste",
    icon: Users,
    className: "bg-blue-100 text-blue-700 ring-blue-600/20",
  },
};

async function getWaitlistApplications(status?: string) {
  if (status) {
    return db
      .select()
      .from(waitlistApplications)
      .where(eq(waitlistApplications.status, status as "pending" | "approved" | "rejected" | "waitlisted"))
      .orderBy(waitlistApplications.position, desc(waitlistApplications.createdAt));
  }

  return db
    .select()
    .from(waitlistApplications)
    .orderBy(waitlistApplications.position, desc(waitlistApplications.createdAt));
}

function WaitlistTable({ applications }: { applications: Awaited<ReturnType<typeof getWaitlistApplications>> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Verein
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Kontakt
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Details
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
              Eingereicht
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status];
            const StatusIcon = statusConfig.icon;

            return (
              <tr key={app.id} className={`hover:bg-gray-50/50 transition-colors ${app.type === 'pilot' ? 'bg-primary/5' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{app.clubName}</span>
                      {app.type === "pilot" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-inset ring-primary/30 uppercase">
                          <Rocket className="h-2.5 w-2.5" />
                          Pilot
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{app.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{app.contactEmail}</span>
                    {app.contactName && (
                      <span className="text-xs text-gray-500">{app.contactName}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs text-gray-500 max-w-xs">
                    {app.website && (
                      <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {app.website}
                      </a>
                    )}
                    {app.memberCount && <span>Mitglieder: {app.memberCount}</span>}
                    {app.type === "pilot" && app.message && (
                      <div className="mt-1 p-1 bg-white rounded border border-primary/20 text-[10px] italic">
                        <span className="font-bold text-primary block">Pain Points:</span>
                        <p className="line-clamp-2">{app.message}</p>
                      </div>
                    )}
                    {app.notes && !app.message && <span className="truncate italic">&quot;{app.notes}&quot;</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${statusConfig.className}`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusConfig.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString("de-DE") : "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <WaitlistActions
                    id={app.id}
                    currentStatus={app.status}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WaitlistTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Verein</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kontakt</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Datum</th>
            <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td className="whitespace-nowrap px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-gray-200" /></td>
              <td className="whitespace-nowrap px-6 py-4"><div className="h-4 w-40 animate-pulse rounded bg-gray-200" /></td>
              <td className="whitespace-nowrap px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
              <td className="whitespace-nowrap px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
              <td className="whitespace-nowrap px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function WaitlistContent({ status }: { status?: string }) {
  const applications = await getWaitlistApplications(status);

  return (
    <>
      {applications.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-600">Keine Bewerbungen gefunden</p>
        </div>
      ) : (
        <WaitlistTable applications={applications} />
      )}
    </>
  );
}

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS, session.user.isSuperAdmin)) {
    redirect("/dashboard");
  }

  const { status } = await searchParams;

  const counts = await db
    .select({
      status: waitlistApplications.status,
      count: waitlistApplications.id,
    })
    .from(waitlistApplications)
    .groupBy(waitlistApplications.status);

  const statusCounts = Object.fromEntries(
    counts.map(c => [c.status, c.count])
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Warteliste</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bewerbungen von Vereinen verwalten und freischalten
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/dashboard/admin/waitlist"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            !status
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Alle ({statusCounts.pending || 0 + statusCounts.approved || 0 + statusCounts.rejected || 0 + statusCounts.waitlisted || 0})
        </a>
        <a
          href="/dashboard/admin/waitlist?status=pending"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            status === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
          }`}
        >
          Ausstehend ({statusCounts.pending || 0})
        </a>
        <a
          href="/dashboard/admin/waitlist?status=approved"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            status === "approved"
              ? "bg-green-500 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          Genehmigt ({statusCounts.approved || 0})
        </a>
        <a
          href="/dashboard/admin/waitlist?status=waitlisted"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            status === "waitlisted"
              ? "bg-blue-500 text-white"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          Warteliste ({statusCounts.waitlisted || 0})
        </a>
        <a
          href="/dashboard/admin/waitlist?status=rejected"
          className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            status === "rejected"
              ? "bg-red-500 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          Abgelehnt ({statusCounts.rejected || 0})
        </a>
      </div>

      <Suspense fallback={<WaitlistTableSkeleton />}>
        <WaitlistContent status={status} />
      </Suspense>
    </div>
  );
}