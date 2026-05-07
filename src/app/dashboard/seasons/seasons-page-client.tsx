"use client";

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
import { Badge } from "@/components/ui/badge";

const typeLabels: Record<string, string> = {
  bundesliga: "Bundesliga",
  bezirksliga: "Bezirksliga",
  kreisklasse: "Kreisklasse",
  club_internal: "Vereinsintern",
};

interface Season {
  id: string;
  name: string;
  year: string;
  type: string;
  startDate?: string;
  endDate?: string;
}

interface SeasonsPageClientProps {
  seasons: Season[];
}

export function SeasonsPageClient({ seasons }: SeasonsPageClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saisons</h1>
          <p className="text-sm text-gray-500">
            {seasons.length} Saisons insgesamt
          </p>
        </div>
        <Link href="/dashboard/seasons/new">
          <Button>Neue Saison</Button>
        </Link>
      </div>

      {seasons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Saisons angelegt. Klicke auf &ldquo;Neue Saison&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle Saisons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Jahr</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Zeitraum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((season) => (
                  <TableRow key={season.id}>
                    <TableCell className="font-medium">{season.name}</TableCell>
                    <TableCell>{season.year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{typeLabels[season.type] ?? season.type}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {season.startDate && season.endDate
                        ? `${new Date(season.startDate).toLocaleDateString("de-DE")} - ${new Date(season.endDate).toLocaleDateString("de-DE")}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
