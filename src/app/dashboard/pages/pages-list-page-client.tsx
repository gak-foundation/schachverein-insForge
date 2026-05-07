"use client";

import Link from "next/link";
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
import { Globe, Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

interface PagesListPageClientProps {
  pages: PageItem[];
  canEdit: boolean;
}

export function PagesListPageClient({ pages, canEdit }: PagesListPageClientProps) {
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
          <Link
            href="/dashboard/pages/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5 hover:bg-primary/80 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Seite
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seitenuebersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
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
                  <TableHead>Zuletzt geaendert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
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
                        {page.status === "published" ? "Veroeffentlicht" :
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
                          <Link
                            href={`/dashboard/pages/${page.id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Bearbeiten</span>
                          </Link>
                        )}
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
