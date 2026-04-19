import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Users, 
  Trophy, 
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  PieChart,
  Mail,
  Smartphone,
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";

export default function SaaSPage() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Die moderne Vereinsverwaltung ist da</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-slate-900">
              Dein Schachverein in der <span className="text-primary">Cloud.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Verwalte Mitglieder, organisiere Turniere und automatisiere deine Finanzen. Alles an einem Ort, sicher und intuitiv für den gesamten Vorstand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-8 text-lg font-bold w-full">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold w-full border-2">
                  Demo ansehen
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500 font-medium">
              Keine Kreditkarte erforderlich. Bis zu 20 Mitglieder kostenlos.
            </p>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-indigo-600 rounded-2xl blur opacity-20" />
            <div className="relative bg-card border-4 border-slate-900 rounded-xl shadow-2xl overflow-hidden aspect-video flex">
               {/* Sidebar Mockup */}
               <div className="w-1/5 border-r bg-slate-50 hidden sm:block p-4 space-y-4">
                 <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                 <div className="space-y-2">
                   {[1,2,3,4,5].map(i => <div key={i} className="h-3 w-full bg-slate-100 rounded" />)}
                 </div>
               </div>
               {/* Main Content Mockup */}
               <div className="flex-1 p-8">
                 <div className="flex justify-between items-center mb-8">
                   <div className="h-8 w-48 bg-slate-200 rounded" />
                   <div className="h-10 w-32 bg-primary/20 rounded" />
                 </div>
                 <div className="grid grid-cols-3 gap-4 mb-8">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 border border-dashed rounded-lg" />)}
                 </div>
                 <div className="space-y-4">
                   {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white border rounded shadow-sm" />)}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Alles was dein Verein braucht</h2>
            <p className="text-lg text-slate-600">Entwickelt von Schachspielern für Schachvereine. Wir kennen eure Abläufe.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-indigo-600" />}
              title="Mitgliederverwaltung"
              description="Behalte alle Daten im Blick. Inklusive DSB-Meldelisten-Export und Historie."
            />
            <FeatureCard 
              icon={<Trophy className="h-6 w-6 text-amber-500" />}
              title="Turnierorganisation"
              description="Schweizer System, Rundenturniere oder Vereinsmeisterschaft. Live-Stände für alle."
            />
            <FeatureCard 
              icon={<PieChart className="h-6 w-6 text-emerald-500" />}
              title="Finanzen & Beiträge"
              description="Automatisierte SEPA-Lastschriften und Beitragsrechnungen. Nie wieder Mahnungen schreiben."
            />
            <FeatureCard 
              icon={<Mail className="h-6 w-6 text-blue-500" />}
              title="Kommunikation"
              description="E-Mail-Verteiler für Mannschaften oder den gesamten Verein. DSGVO-konform."
            />
            <FeatureCard 
              icon={<Smartphone className="h-6 w-6 text-slate-600" />}
              title="Mobile First"
              description="Deine Mitglieder können Ergebnisse und Termine direkt auf dem Handy einsehen."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-red-500" />}
              title="Datensicherheit"
              description="Hosting in Deutschland, tägliche Backups und strikte Rollentrennung."
            />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">Warum schach.studio?</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <span className="font-bold">Zeitersparnis:</span> Spare bis zu 10 Stunden Verwaltungsarbeit pro Monat.
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <span className="font-bold">Einfache Übergabe:</span> Dokumentiere alles zentral für den nächsten Vorstand.
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <span className="font-bold">Moderne Außenwirkung:</span> Begeistere neue Mitglieder mit einer professionellen App.
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <blockquote className="text-2xl font-medium italic text-slate-800">
                „Endlich haben wir ein System, das wirklich versteht, wie ein Schachverein funktioniert. Der Turnier-Manager ist ein Gamechanger.“
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div>
                  <div className="font-bold">Dr. Markus S.</div>
                  <div className="text-sm text-slate-500">1. Vorsitzender, SC Springer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">Faire Preise für jeden Verein</h2>
            <p className="text-lg text-slate-400">Starte kostenlos und wachse mit uns.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Basis</h3>
              <div className="text-3xl font-bold mb-6">0€ <span className="text-sm font-normal text-slate-400">/ Monat</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Bis 20 Mitglieder</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Mitgliederverwaltung</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Terminkalender</li>
                <li className="flex items-center gap-2 text-sm text-slate-500 italic">Kein Turnier-Manager</li>
              </ul>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">Kostenlos starten</Button>
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-xl p-8 border-4 border-primary flex flex-col relative transform scale-105 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4 rounded-full">
                Empfohlen
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Verein</h3>
              <div className="text-3xl font-bold mb-6 text-slate-900">19€ <span className="text-sm font-normal text-slate-500">/ Monat</span></div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-700">
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Bis 100 Mitglieder</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Voller Turnier-Manager</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Finanzen & Lastschriften</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> E-Mail Verteiler</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> 5 Admin-Nutzer</li>
              </ul>
              <Link href="/auth/signup">
                <Button className="w-full">Jetzt upgraden</Button>
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Verband</h3>
              <div className="text-3xl font-bold mb-6">Individuell</div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Unbegrenzte Mitglieder</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> Multi-Vereins-Modus</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> White-Label Option</li>
                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" /> API-Zugang</li>
              </ul>
              <Link href="/kontakt">
                <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">Kontakt aufnehmen</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-linear-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Bereit für den ersten Zug?</h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Schließe dich modernen Schachvereinen an und bringe deine Verwaltung auf das nächste Level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="h-16 px-12 text-lg font-bold shadow-xl shadow-primary/20">
                Kostenlos anmelden
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white border rounded-2xl hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
