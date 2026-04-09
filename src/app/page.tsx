import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♔</span>
            <span className="text-lg font-semibold">Schachverein</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/vereinswebsite" className="text-sm text-gray-600 hover:text-gray-900">
              Verein
            </Link>
            <Link href="/vereinswebsite/teams" className="text-sm text-gray-600 hover:text-gray-900">
              Mannschaften
            </Link>
            <Link href="/vereinswebsite/tournaments" className="text-sm text-gray-600 hover:text-gray-900">
              Turniere
            </Link>
            <Link href="/vereinswebsite/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Kontakt
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Anmelden
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-6xl">♔</span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Willkommen im Schachverein
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Mitgliederverwaltung, Turniere, Mannschaften und mehr — alles an einem Ort.
              Verwalte deinen Verein modern und effizient.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg">
                  Jetzt anmelden
                </Button>
              </Link>
              <Link href="/vereinswebsite">
                <Button variant="outline" size="lg">
                  Mehr erfahren
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">👥</span>
                <h3 className="mt-4 font-semibold">Mitgliederverwaltung</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Mitglieder, Familienzuordnungen, DWZ/Elo-Tracking und Rollen — alles im Blick.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">♟️</span>
                <h3 className="mt-4 font-semibold">Mannschaften & Ligabetrieb</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Brettreihenfolgen, Mannschaftsaufstellungen und Ergebniserfassung je Brett.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">🏆</span>
                <h3 className="mt-4 font-semibold">Turnierverwaltung</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Schweizer System, Rundenturniere, Schnellschach und PGN-Import/Export.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">💰</span>
                <h3 className="mt-4 font-semibold">Beitraege & SEPA</h3>
                <p className="mt-2 text-sm text-gray-600">
                  SEPA-Lastschrift, Beitragsverwaltung und Erinnerungen — DSGVO-konform.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">📅</span>
                <h3 className="mt-4 font-semibold">Kalender & Events</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Training, Turniere, Mannschaftskaempfe — alles zentral verwaltet.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <span className="text-2xl">📱</span>
                <h3 className="mt-4 font-semibold">PWA & Offline</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Auch ohne Internet nutzbar — Ergebnisse an Spieltagen offline eintragen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          <p>&copy; 2026 Schachverein. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}