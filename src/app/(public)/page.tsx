import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChessKnight, 
  Calendar, 
  Users, 
  Trophy, 
  ArrowRight,
  MapPin,
  Clock
} from "lucide-react";
import { getPublicEvents, getPublicTeams, getClubStats, getUpcomingMatches } from "@/lib/public-actions";

export default async function HomePage() {
  const [events, teams, stats, matches] = await Promise.all([
    getPublicEvents(3),
    getPublicTeams(),
    getClubStats(),
    getUpcomingMatches(3),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Willkommen beim Schachverein
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Gemeinschaft, Strategie und Leidenschaft für das königliche Spiel. 
              Ob Anfänger oder Meister – bei uns ist jeder willkommen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/termine">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <Calendar className="mr-2 h-5 w-5" />
                  Termine entdecken
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Mitglied werden
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative chess pieces */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <ChessKnight className="h-96 w-96" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900">{stats.memberCount}</div>
                <p className="text-gray-600 mt-2">Aktive Mitglieder</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Trophy className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900">{stats.teamCount}</div>
                <p className="text-gray-600 mt-2">Mannschaften</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <ChessKnight className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-gray-900">{stats.matchesThisYear}</div>
                <p className="text-gray-600 mt-2">Spiele diese Saison</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Kommende Termine</h2>
            <Link href="/termine" className="flex items-center text-blue-600 hover:text-blue-700">
              Alle Termine <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-500">Aktuell keine Termine geplant.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(event.startDate).toLocaleDateString("de-DE", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: event.isAllDay ? undefined : "2-digit",
                            minute: event.isAllDay ? undefined : "2-digit",
                          })}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {event.description && (
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2">{event.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Teams Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Unsere Mannschaften</h2>
            <Link href="/mannschaften" className="flex items-center text-blue-600 hover:text-blue-700">
              Alle Mannschaften <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {teams.length === 0 ? (
            <p className="text-gray-500">Aktuell keine Mannschaften eingetragen.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        {team.league && (
                          <p className="text-sm text-gray-500">{team.league}</p>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {team.captainName && (
                      <p className="text-sm text-gray-600">
                        Mannschaftsführer: {team.captainName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Matches Section */}
      {matches.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Kommende Spieltage</h2>

            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[120px]">
                          <p className="font-semibold">{match.homeTeamName}</p>
                        </div>
                        <div className="text-gray-400 font-bold">vs</div>
                        <div className="min-w-[120px]">
                          <p className="font-semibold">{match.awayTeamName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {match.matchDate && new Date(match.matchDate).toLocaleDateString("de-DE", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        {match.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {match.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
