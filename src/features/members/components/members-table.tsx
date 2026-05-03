import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
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
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
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
  selectedIds,
  onSelectionChange,
  onSelectAll,
  allSelected,
}: MembersTableProps) {
  return (
    <div className="py-8">
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
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card shadow-sm">
            <Table aria-label="Mitgliederliste">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
                  {hasWritePermission && (
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input focus:ring-1 focus:ring-ring text-primary bg-background"
                        checked={allSelected}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        aria-label="Alle auswaehlen"
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground" aria-sort={sortBy === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={buildSortLink("name")} className="flex items-center gap-2 hover:text-foreground transition-colors">
                      Name {getSortIcon("name")}
                    </Link>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                    Alter
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground" aria-sort={sortBy === "email" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={buildSortLink("email")} className="flex items-center gap-2 hover:text-foreground transition-colors">
                      E-Mail {getSortIcon("email")}
                    </Link>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground text-right" aria-sort={sortBy === "dwz" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={buildSortLink("dwz")} className="flex items-center justify-end gap-2 hover:text-foreground transition-colors">
                      DWZ {getSortIcon("dwz")}
                    </Link>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground" aria-sort={sortBy === "role" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={buildSortLink("role")} className="flex items-center gap-2 hover:text-foreground transition-colors">
                      Rolle {getSortIcon("role")}
                    </Link>
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest font-semibold text-muted-foreground" aria-sort={sortBy === "status" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={buildSortLink("status")} className="flex items-center gap-2 hover:text-foreground transition-colors">
                      Status {getSortIcon("status")}
                    </Link>
                  </TableHead>
                  <TableHead className="text-right w-16" aria-label="Aktionen"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow 
                    key={member.id} 
                    className="group hover:bg-muted/40 even:bg-muted/10 transition-colors border-b border-border/40 last:border-0"
                  >
                    {hasWritePermission && (
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input focus:ring-1 focus:ring-ring text-primary bg-background"
                          checked={selectedIds.has(member.id)}
                          onChange={(e) => onSelectionChange(member.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${member.firstName} ${member.lastName} auswaehlen`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-heading text-lg tracking-tight text-foreground">
                      <Link 
                        href={`/dashboard/members/${member.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {member.firstName} <span className="font-bold">{member.lastName}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium text-sm">
                      {calculateAge(member.dateOfBirth) ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">{member.email || "—"}</TableCell>
                    <TableCell className="text-right font-heading text-lg">
                      {member.dwz ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-semibold",
                        member.status === "active" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {statusLabels[member.status] ?? member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasWritePermission && (
                        <Link href={`/dashboard/members/${member.id}/edit`} className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all focus:opacity-100" aria-label="Bearbeiten">
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <nav className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4" aria-label="Pagination">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                Seite <span className="text-foreground">{currentPage}</span> von <span className="text-foreground">{totalPages}</span>
              </p>
              <div className="flex gap-6">
                {currentPage > 1 && (
                  <Link href={buildMembersLink({ page: String(currentPage - 1) })} className="text-xs uppercase tracking-widest font-semibold flex items-center hover:text-primary transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Vorherige
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link href={buildMembersLink({ page: String(currentPage + 1) })} className="text-xs uppercase tracking-widest font-semibold flex items-center hover:text-primary transition-colors">
                    Nächste
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
