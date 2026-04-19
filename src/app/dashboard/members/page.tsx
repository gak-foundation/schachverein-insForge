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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowUpDown, Users, ChevronLeft, ChevronRight, Upload, Search, X } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { DwzSyncButton } from "@/components/clubs/dwz-sync-button";
import { cn, calculateAge } from "@/lib/utils";

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

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Mitgliederverwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams;
  const currentPage = Number(filters.page) || 1;
  const sortBy = (filters.sortBy || "name") as SortField;
  const sortOrder = (filters.sortOrder || "asc") as SortOrder;
  
  const { members: allMembers, totalCount, totalPages } = await getMembers(
    filters.search,
    filters.role,
    filters.status,
    sortBy as MemberSortField,
    sortOrder as MembersListSortOrder,
    currentPage
  );
  
  const paginatedMembers = allMembers;
  
  function buildMembersLink(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.page && filters.page !== "1") params.set("page", filters.page);

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
      sortOrder: filters.sortBy === field && filters.sortOrder !== "desc" ? "desc" : "asc",
      page: undefined,
    });
  }
  
  function getSortIcon(field: SortField) {
    if (filters.sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    return filters.sortOrder === "desc" 
      ? <span className="text-primary font-bold">↓</span> 
      : <span className="text-primary font-bold">↑</span>;
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

  const activeFilters = [
    filters.search ? { label: `Suche: ${filters.search}`, href: buildMembersLink({ search: undefined, page: undefined }) } : null,
    filters.role ? { label: `Rolle: ${filters.role}`, href: buildMembersLink({ role: undefined, page: undefined }) } : null,
    filters.status ? { label: `Status: ${statusLabels[filters.status] ?? filters.status}`, href: buildMembersLink({ status: undefined, page: undefined }) } : null,
  ].filter((value): value is { label: string; href: string } => value !== null);

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
          {hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.DWZ_SYNC) && (
            <DwzSyncButton />
          )}
          {hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE) && (
            <>
              <Link href="/dashboard/members/import">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
              </Link>
              <PrintButton />
              <Link href="/dashboard/members/new">
                <Button size="sm">
                  <span className="mr-2">+</span> Neues Mitglied
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form className="flex flex-col gap-4 lg:flex-row lg:items-end" method="GET" action="/dashboard/members">
            <div className="flex-1 space-y-2">
              <label htmlFor="member-search" className="text-sm font-medium text-gray-700">
                Mitglieder suchen
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="member-search"
                  type="text"
                  name="search"
                  placeholder="Suche nach Name oder E-Mail"
                  defaultValue={filters.search ?? ""}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
                  Rolle
                </label>
                <select id="role-filter" name="role" defaultValue={filters.role ?? ""} className="h-10 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">Alle Rollen</option>
                  <option value="admin">Admin</option>
                  <option value="vorstand">Vorstand</option>
                  <option value="sportwart">Sportwart</option>
                  <option value="jugendwart">Jugendwart</option>
                  <option value="kassenwart">Kassenwart</option>
                  <option value="trainer">Trainer</option>
                  <option value="mitglied">Mitglied</option>
                  <option value="eltern">Eltern</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select id="status-filter" name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="resigned">Ausgetreten</option>
                  <option value="honorary">Ehrenmitglied</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:pb-0.5">
              <Button type="submit" className="min-w-28">Filtern</Button>
              <Link href="/dashboard/members">
                <Button type="button" variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Zurücksetzen
                </Button>
              </Link>
            </div>
          </form>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aktive Filter</span>
              {activeFilters.map((filter) => (
                <Link
                  key={filter.label}
                  href={filter.href}
                  className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400"
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle id="members-list-title">Mitgliederliste</CardTitle>
        </CardHeader>
        <CardContent>
          {allMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Keine Mitglieder"
              description={
                filters.search || filters.role || filters.status
                  ? "Keine Mitglieder mit diesen Filtern gefunden."
                  : "Noch keine Mitglieder im System."
              }
              action={
                hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE)
                  ? { label: "Erstes Mitglied anlegen", href: "/dashboard/members/new" }
                  : undefined
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800">
                <Table aria-labelledby="members-list-title">
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead aria-sort={sortBy === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("name")} className="flex items-center gap-1 hover:text-primary transition-colors py-2">
                        Name {getSortIcon("name")}
                      </Link>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1 py-2 text-slate-500 font-medium">
                        Alter
                      </span>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "email" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("email")} className="flex items-center gap-1 hover:text-primary transition-colors py-2">
                        E-Mail {getSortIcon("email")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right" aria-sort={sortBy === "dwz" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("dwz")} className="flex items-center justify-end gap-1 hover:text-primary transition-colors py-2">
                        DWZ {getSortIcon("dwz")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right" aria-sort={sortBy === "elo" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("elo")} className="flex items-center justify-end gap-1 hover:text-primary transition-colors py-2">
                        Elo {getSortIcon("elo")}
                      </Link>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "role" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("role")} className="flex items-center gap-1 hover:text-primary transition-colors py-2">
                        Rolle {getSortIcon("role")}
                      </Link>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "status" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("status")} className="flex items-center gap-1 hover:text-primary transition-colors py-2">
                        Status {getSortIcon("status")}
                      </Link>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow 
                      key={member.id} 
                      className="group relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        <Link 
                          href={`/dashboard/members/${member.id}`}
                          className="after:absolute after:inset-0 after:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-sm"
                        >
                          {member.firstName} {member.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 tabular-nums">
                        {calculateAge(member.dateOfBirth) ?? "—"}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">{member.email}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">
                        {member.dwz ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-500 dark:text-slate-400">
                        {member.elo ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm">
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm",
                            statusColors[member.status] ?? "bg-slate-100 text-slate-800 border-slate-200"
                          )}
                        >
                          {statusLabels[member.status] ?? member.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 font-medium">
                    Seite <span className="text-slate-900 dark:text-slate-100">{currentPage}</span> von <span className="text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount} Einträge)
                  </p>
                  <div className="flex gap-3">
                    {currentPage > 1 && (
                      <Link href={buildMembersLink({ page: String(currentPage - 1) })}>
                        <Button variant="outline" size="default" className="h-10 px-4">
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Vorherige
                        </Button>
                      </Link>
                    )}
                    {currentPage < totalPages && (
                      <Link href={buildMembersLink({ page: String(currentPage + 1) })}>
                        <Button variant="outline" size="default" className="h-10 px-4">
                          Nächste
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}