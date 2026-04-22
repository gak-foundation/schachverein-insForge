import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Users, Trophy, Calendar, Shield } from "lucide-react";
import { redirectToDemo } from "@/lib/actions/demo";

export const metadata = {
  title: "Demo erkunden | schach.studio",
  description: "Erleben Sie schach.studio in Aktion - interaktive Demo mit einem Beispiel-Verein",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4 fill-current" />
            <span>Interaktive Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
            Erleben Sie schach.studio <span className="text-primary">in Aktion</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Testen Sie alle Features mit unserem Demo-Verein &quot;SC Demo Springer&quot;. 
            Keine Registrierung nötig - einfach auf &quot;Demo starten&quot; klicken!
          </p>
        </div>

        {/* Demo Preview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="border-2 border-primary/10">
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">10 Mitglieder</CardTitle>
              <CardDescription>Mit DWZ, Rollen & Kontaktdaten</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-primary/10">
            <CardHeader className="pb-3">
              <Trophy className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">2 Mannschaften</CardTitle>
              <CardDescription>Bezirksliga & Kreisklasse</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-primary/10">
            <CardHeader className="pb-3">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">3 Turniere</CardTitle>
              <CardDescription>Swiss, Rundrobin & abgeschlossen</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-primary/10">
            <CardHeader className="pb-3">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Vorstand-Rolle</CardTitle>
              <CardDescription>Alle Features freigeschaltet</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto border-primary/20 shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Bereit für die Demo?</h2>
            <p className="text-muted-foreground mb-8">
              Sie werden automatisch als <strong>Demo-Vorstand</strong> eingeloggt. 
              Alle Änderungen werden nach 24 Stunden zurückgesetzt.
            </p>
            
            <form action={redirectToDemo}>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-12 text-lg font-bold"
              >
                Demo starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground mt-6">
              Alternativ können Sie sich auch{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                kostenlos registrieren
              </Link>{" "}
              und Ihren eigenen Verein anlegen.
            </p>
          </CardContent>
        </Card>

        {/* Feature List */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Was Sie in der Demo erleben können</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Mitgliederliste mit Filter & Suche",
              "Turnierverwaltung mit Paarungen",
              "Mannschaftsaufstellungen",
              "Terminkalender & Veranstaltungen",
              "Finanzübersicht & Beiträge",
              "DWZ-Tracking & Statistiken",
              "Vereins-Website Editor",
              "Druckbare Listen & Auswertungen",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
            <strong>Hinweis:</strong> Die Demo-Daten werden täglich zurückgesetzt. 
            Bitte keine sensiblen Daten eingeben. Für produktiven Einsatz empfehlen wir 
            die kostenlose Registrierung eines eigenen Vereins.
          </div>
        </div>
      </div>
    </div>
  );
}
