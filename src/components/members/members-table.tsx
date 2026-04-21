import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, calculateAge } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  dwz: number | null;
  elo: number | null;
  role: string;
  status: string;
  dateOfBirth: string | null;
}

interface MembersTableProps {
  members: Member[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: string;
  sortOrder: string;
  getSortIcon: (field: any) => React.ReactNode;
  buildSortLink: (field: any) => string;
  buildMembersLink: (overrides: Record<string, string | undefined>) => string;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  hasWritePermission: boolean;
}

export function MembersTable({
  members,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  getSortIcon,
  buildSortLink,
  buildMembersLink,
  statusColors,
  statusLabels,
  hasWritePermission,
}: MembersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle id="members-list-title">Mitgliederliste</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Mitglieder"
            description="Keine Mitglieder mit diesen Filtern gefunden oder noch keine Mitglieder im System."
            action={
              hasWritePermission
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
                      <Link href={buildSortLink("name")} className="flex items-center gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        Name {getSortIcon("name")}
                      </Link>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1 py-2 text-slate-500 font-medium">
                        Alter
                      </span>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "email" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("email")} className="flex items-center gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        E-Mail {getSortIcon("email")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right" aria-sort={sortBy === "dwz" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("dwz")} className="flex items-center justify-end gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        DWZ {getSortIcon("dwz")}
                      </Link>
                    </TableHead>
                    <TableHead className="text-right" aria-sort={sortBy === "elo" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("elo")} className="flex items-center justify-end gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        Elo {getSortIcon("elo")}
                      </Link>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "role" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("role")} className="flex items-center gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        Rolle {getSortIcon("role")}
                      </Link>
                    </TableHead>
                    <TableHead aria-sort={sortBy === "status" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                      <Link href={buildSortLink("status")} className="flex items-center gap-1 hover:text-primary transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                        Status {getSortIcon("status")}
                      </Link>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
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
              <nav className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800" aria-label="Pagination">
                <p className="text-sm text-slate-500 font-medium">
                  Seite <span className="text-slate-900 dark:text-slate-100">{currentPage}</span> von <span className="text-slate-900 dark:text-slate-100">{totalPages}</span> ({totalCount} Einträge)
                </p>
                <div className="flex gap-3">
                  {currentPage > 1 && (
                    <Link href={buildMembersLink({ page: String(currentPage - 1) })}>
                      <Button variant="outline" size="default" className="h-10 px-4">
                        <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                        Vorherige
                      </Button>
                    </Link>
                  )}
                  {currentPage < totalPages && (
                    <Link href={buildMembersLink({ page: String(currentPage + 1) })}>
                      <Button variant="outline" size="default" className="h-10 px-4">
                        Nächste
                        <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </Button>
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
