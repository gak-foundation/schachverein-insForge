"use client";

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
import Link from "next/link";

interface Season {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  league?: string;
}

interface TeamsPageClientProps {
  teams: Team[];
  seasons: Season[];
}

export function TeamsPageClient({ teams, seasons }: TeamsPageClientProps) {
  const currentSeason = seasons[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mannschaften</h1>
          <p className="text-sm text-gray-500">
            {teams.length} Mannschaften in der aktuellen Saison
          </p>
        </div>
        <Link href="/dashboard/teams/new">
          <Button>Neue Mannschaft</Button>
        </Link>
      </div>

      {seasons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Erstelle zuerst eine Saison, um Mannschaften anzulegen.
          </CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Noch keine Mannschaften angelegt. Klicke auf &ldquo;Neue Mannschaft&rdquo; um zu beginnen.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Saison {currentSeason?.name ?? "Aktuelle Saison"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mannschaft</TableHead>
                  <TableHead>Liga</TableHead>
                  <TableHead>Besetzung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/teams/${team.id}`}>
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {team.league ? (
                        <Badge variant="outline">{team.league}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      Brettaufstellung ansehen
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
