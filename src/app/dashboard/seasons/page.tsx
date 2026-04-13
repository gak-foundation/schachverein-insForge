import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getSeasons } from "@/lib/actions/events";
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

const typeLabels: Record<string, string> = {
  bundesliga: "Bundesliga",
  bezirksliga: "Bezirksliga",
  kreisklasse: "Kreisklasse",
  club_internal: "Vereinsintern",
};

export const metadata = {
  title: "Saisons",
};

export default async function SeasonsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const allSeasons = await getSeasons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saisons</h1>
          <p className="text-sm text-gray-500">
            {allSeasons.length} Saisons insgesamt
          </p>
        </div>
        <Link href="/dashboard/seasons/new">
          <Button>Neue Saison</Button>
        </Link>
      </div>

      {allSeasons.length === 0 ? (
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
                {allSeasons.map((season) => (
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