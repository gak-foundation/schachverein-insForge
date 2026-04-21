import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getMembers,
  type MemberSortField,
  type SortOrder as MembersListSortOrder,
} from "@/lib/actions/members";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Upload } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { DwzSyncButton } from "@/components/clubs/dwz-sync-button";
import { MembersFilters } from "@/components/members/members-filters";
import { MembersTable } from "@/components/members/members-table";

export const metadata = {
  title: "Mitglieder",
};

type SortField = "name" | "email" | "dwz" | "elo" | "role" | "status";
type SortOrder = "asc" | "desc";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string; 
    role?: string; 
    status?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_READ, session.user.isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung für die Mitgliederverwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams ?? {};
  const currentPage = Number(filters?.page) || 1;
  const sortBy = (filters?.sortBy || "name") as SortField;
  const sortOrder = (filters?.sortOrder || "asc") as SortOrder;

  const { members, totalCount, totalPages } = await getMembers(
    filters?.search,
    filters?.role,
    filters?.status,
    sortBy as MemberSortField,
    sortOrder as MembersListSortOrder,
    currentPage
  );
  
  function buildMembersLink(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.role) params.set("role", filters.role);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters?.page && filters.page !== "1") params.set("page", filters.page);

    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    return query ? `/dashboard/members?${query}` : "/dashboard/members";
  }

  function buildSortLink(field: SortField) {
    return buildMembersLink({
      sortBy: field,
      sortOrder: sortBy === field && sortOrder !== "desc" ? "desc" : "asc",
      page: undefined,
    });
  }
  
  function getSortIcon(field: SortField) {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    return sortOrder === "desc" 
      ? <span className="text-primary font-bold" aria-hidden="true">↓</span> 
      : <span className="text-primary font-bold" aria-hidden="true">↑</span>;
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
    inactive: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    resigned: "bg-red-100 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
    honorary: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
  };

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  const hasWritePermission = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE, session.user.isSuperAdmin);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-gray-500">
            {totalCount} Mitglieder insgesamt
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.DWZ_SYNC, session.user.isSuperAdmin) && (
            <DwzSyncButton />
          )}
          {hasWritePermission && (
            <>
              <Link href="/dashboard/members/import">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                  Import/Export
                </Button>
              </Link>
              <PrintButton />
              <Link href="/dashboard/members/new">
                <Button size="sm">
                  <span className="mr-2" aria-hidden="true">+</span> Neues Mitglied
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <MembersFilters 
        filters={filters} 
        buildMembersLink={buildMembersLink} 
      />

      <MembersTable 
        members={members}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        getSortIcon={getSortIcon}
        buildSortLink={buildSortLink}
        buildMembersLink={buildMembersLink}
        statusColors={statusColors}
        statusLabels={statusLabels}
        hasWritePermission={hasWritePermission}
      />
    </div>
  );
}
