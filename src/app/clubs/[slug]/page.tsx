import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { clubs } from "@/lib/db/schema";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface ClubPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });

  if (!club) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-linear-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 text-center">
          {club.logoUrl && (
            <img src={club.logoUrl} alt={club.name} className="mx-auto h-24 w-24 object-contain mb-8 rounded-2xl shadow-lg bg-white p-2" />
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
            Willkommen beim <br />
            <span className="text-primary">{club.name}</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Dein Verein für Schachbegeisterte in {club.address?.city || "der Region"}. 
            Erlebe spannende Partien, Training und Gemeinschaft.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/mannschaften">
              <Button size="lg" className="h-14 px-8 text-lg font-bold">
                Unsere Teams
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/termine">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2">
                Aktuelle Termine
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mitglied werden</h3>
              <p className="text-muted-foreground mb-6">
                Werde Teil unserer Gemeinschaft. Wir freuen uns über jedes neue Mitglied, vom Anfänger bis zum Großmeister.
              </p>
              <Link href="/kontakt">
                <Button variant="link" className="p-0 h-auto font-bold text-primary">
                  Mehr erfahren <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="p-8 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Turniere</h3>
              <p className="text-muted-foreground mb-6">
                Wir veranstalten regelmäßig Turniere für alle Spielstärken. Von der Vereinsmeisterschaft bis zum Open.
              </p>
              <Link href="/turniere">
                <Button variant="link" className="p-0 h-auto font-bold text-amber-600">
                  Zu den Turnieren <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="p-8 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Training</h3>
              <p className="text-muted-foreground mb-6">
                Unser Training findet regelmäßig statt. Wir bieten Gruppen für Jugendliche und Erwachsene an.
              </p>
              <Link href="/termine">
                <Button variant="link" className="p-0 h-auto font-bold text-emerald-600">
                  Trainingszeiten <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
