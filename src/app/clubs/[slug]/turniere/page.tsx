import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, ArrowRight } from "lucide-react";
import { getPublicTournaments } from "@/lib/public-actions";

interface TournamentsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TournamentsPage({ params }: TournamentsPageProps) {
  const { slug } = await params;
  const tournaments = await getPublicTournaments(slug);

  const typeLabels: Record<string, string> = {
    swiss: "Schweizer System",
    round_robin: "Rundenturnier",
    rapid: "Schnellschach",
    blitz: "Blitz",
    team_match: "Mannschaftskampf",
    club_championship: "Vereinsmeisterschaft",
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Turniere</h1>
        <p className="text-lg text-gray-600 mb-12">
          Bei uns finden regelmäßig Turniere statt – 
          von der Vereinsmeisterschaft bis zu offenen Blitzturnieren.
        </p>

        {tournaments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keine Turniere</h2>
            <p className="text-gray-500">Aktuell sind keine Turniere geplant.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{tournament.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {typeLabels[tournament.type] || tournament.type}
                        </span>
                        {tournament.isCompleted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                            Abgeschlossen
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(tournament.startDate).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.location && (
                    <p className="text-gray-600 mb-2">Ort: {tournament.location}</p>
                  )}
                  <Link
                    href={`/turniere/${tournament.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Details ansehen <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
