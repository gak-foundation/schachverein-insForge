import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import { getPublicTeams } from "@/lib/public-actions";

export const metadata = {
  title: "Mannschaften",
};

export default async function TeamsPage() {
  const teams = await getPublicTeams();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Unsere Mannschaften</h1>
        <p className="text-lg text-gray-600 mb-12">
          Wir stellen mehrere Mannschaften in verschiedenen Ligen. 
          Ob Bezirksliga oder Kreisklasse – für jeden Spieler ist etwas dabei.
        </p>

        {teams.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Mannschaften</h2>
            <p className="text-gray-500">Die Mannschaftsdaten werden aktuell gepflegt.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Trophy className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{team.name}</h2>
                        {team.league && (
                          <p className="text-gray-600">{team.league}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{team.seasonName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {team.captainName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Mannschaftsführer: {team.captainName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Interesse, in einer Mannschaft mitzuspielen?</p>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </div>
  );
}
