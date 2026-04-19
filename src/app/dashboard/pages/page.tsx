import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getPages, type PageSortField, type SortOrder } from "@/lib/actions/cms";
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
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = {
  title: "Website-Seiten",
};

export default async function PagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string; 
    status?: string;
    sortBy?: PageSortField;
    sortOrder?: SortOrder;
    page?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_READ)) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Keine Berechtigung fuer die Website-Verwaltung.</p>
      </div>
    );
  }

  const filters = await searchParams;
  const currentPage = Number(filters.page) || 1;
  const sortBy = filters.sortBy || "updatedAt";
  const sortOrder = filters.sortOrder || "desc";
  
  const { pages: allPages, totalCount, totalPages } = await getPages(
    filters.search,
    filters.status,
    sortBy,
    sortOrder,
    currentPage
  );

  const canEdit = hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website-Seiten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Inhalte Ihrer Vereins-Website.
          </p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/dashboard/pages/new">
              <Plus className="mr-2 h-4 w-4" />
              Neue Seite
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seitenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {allPages.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="Keine Seiten gefunden"
              description="Erstellen Sie Ihre erste Seite, um mit Ihrer Website zu starten."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Zuletzt geändert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        page.status === "published" ? "default" :
                        page.status === "draft" ? "secondary" :
                        "outline"
                      }>
                        {page.status === "published" ? "Veröffentlicht" :
                         page.status === "draft" ? "Entwurf" :
                         page.status === "scheduled" ? "Geplant" : "Archiviert"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(page.updatedAt), "dd. MMM yyyy, HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/pages/${page.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Bearbeiten</span>
                            </Link>
                          </Button>
                        )}
                        {/* Weitere Aktionen wie Löschen könnten hier folgen */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
