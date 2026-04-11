import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getMembers } from "@/lib/actions";
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
import { ArrowUpDown, Users, ChevronLeft, ChevronRight, Upload, Download } from "lucide-react";
import { exportMembersToCSVAction } from "@/lib/actions";
import { PrintButton } from "@/components/print-button";

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
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Mitgliederverwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams;
  const allMembers = await getMembers(filters.search, filters.role, filters.status);
  
  const ITEMS_PER_PAGE = 25;
  const currentPage = Number(filters.page) || 1;
  
  let sortedMembers = [...allMembers];
  
  if (filters.sortBy) {
    const order = filters.sortOrder === "desc" ? -1 : 1;
    sortedMembers.sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;
      
      switch (filters.sortBy) {
        case "name":
          aVal = `${a.lastName} ${a.firstName}`;
          bVal = `${b.lastName} ${b.firstName}`;
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "dwz":
          aVal = a.dwz ?? 0;
          bVal = b.dwz ?? 0;
          break;
        case "elo":
          aVal = a.elo ?? 0;
          bVal = b.elo ?? 0;
          break;
        case "role":
          aVal = a.role;
          bVal = b.role;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * order;
      }
      return ((aVal as number) - (bVal as number)) * order;
    });
  }
  
  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = sortedMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  function buildSortLink(field: SortField) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    
    params.set("sortBy", field);
    if (filters.sortBy === field && filters.sortOrder !== "desc") {
      params.set("sortOrder", "desc");
    } else {
      params.set("sortOrder", "asc");
    }
    
    return `/dashboard/members?${params.toString()}`;
  }
  
  function getSortIcon(field: SortField) {
    if (filters.sortBy !== field) return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    return filters.sortOrder === "desc" 
      ? <span className="text-blue-600">↓</span> 
      : <span className="text-blue-600">↑</span>;
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    resigned: "bg-red-100 text-red-800",
    honorary: "bg-yellow-100 text-yellow-800",
  };

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-gray-500">
            {allMembers.length} Mitglieder insgesamt
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE) && (
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
        <CardContent className="pt-6">
          <form className="flex flex-wrap gap-4" method="GET" action="/dashboard/members">
            <input
              type="text"
              name="search"
              placeholder="Suche nach Name, E-Mail..."
              defaultValue={filters.search ?? ""}
              className="max-w-sm flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select name="role" defaultValue={filters.role ?? ""} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
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
            <select name="status" defaultValue={filters.status ?? ""} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="resigned">Ausgetreten</option>
              <option value="honorary">Ehrenmitglied</option>
            </select>
            <Button type="submit" variant="outline">Filtern</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mitgliederliste</CardTitle>
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
                hasPermission(session.user.role, session.user.permissions ?? [], PERMISSIONS.MEMBERS_WRITE)
                  ? { label: "Erstes Mitglied anlegen", href: "/dashboard/members/new" }
                  : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <Link href={buildSortLink("name")} className="flex items-center gap-1 hover:text-blue-600">
                        Name {getSortIcon("name")}
                      </Link>
                    </TableHead>
                    <TableHead>
                      <Link href={buildSortLink("email")} className="flex items-center gap-1 hover:text-blue-600">
                        E-Mail {getSortIcon("email")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right">
                      <Link href={buildSortLink("dwz")} className="flex items-center justify-end gap-1 hover:text-blue-600">
                        DWZ {getSortIcon("dwz")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right">
                      <Link href={buildSortLink("elo")} className="flex items-center justify-end gap-1 hover:text-blue-600">
                        Elo {getSortIcon("elo")}
                      </Link>
                    </TableHead>
                    <TableHead>
                      <Link href={buildSortLink("role")} className="flex items-center gap-1 hover:text-blue-600">
                        Rolle {getSortIcon("role")}
                      </Link>
                    </TableHead>
                    <TableHead>
                      <Link href={buildSortLink("status")} className="flex items-center gap-1 hover:text-blue-600">
                        Status {getSortIcon("status")}
                      </Link>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow key={member.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/members/${member.id}`}>
                          {member.firstName} {member.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-500">{member.email}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.dwz ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.elo ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[member.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[member.status] ?? member.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Seite {currentPage} von {totalPages} ({allMembers.length} Einträge)
                  </p>
                  <div className="flex gap-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/dashboard/members?${(() => {
                          const params = new URLSearchParams();
                          if (filters.search) params.set("search", filters.search);
                          if (filters.role) params.set("role", filters.role);
                          if (filters.status) params.set("status", filters.status);
                          if (filters.sortBy) params.set("sortBy", filters.sortBy);
                          if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
                          params.set("page", String(currentPage - 1));
                          return params.toString();
                        })()}`}
                      >
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Zurück
                        </Button>
                      </Link>
                    )}
                    {currentPage < totalPages && (
                      <Link
                        href={`/dashboard/members?${(() => {
                          const params = new URLSearchParams();
                          if (filters.search) params.set("search", filters.search);
                          if (filters.role) params.set("role", filters.role);
                          if (filters.status) params.set("status", filters.status);
                          if (filters.sortBy) params.set("sortBy", filters.sortBy);
                          if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
                          params.set("page", String(currentPage + 1));
                          return params.toString();
                        })()}`}
                      >
                        <Button variant="outline" size="sm">
                          Weiter
                          <ChevronRight className="h-4 w-4 ml-1" />
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