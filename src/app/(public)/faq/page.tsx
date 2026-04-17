import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  CreditCard, 
  HelpCircle, 
  Mail, 
  Package, 
  Rocket, 
  Shield, 
  Smartphone, 
  Users, 
  Wrench 
} from "lucide-react";

export const metadata = {
  title: "FAQ - Häufig gestellte Fragen",
  description: "Antworten auf häufig gestellte Fragen zur schach.studio Software für Schachvereine.",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Häufig gestellte Fragen</h1>
          <p className="text-lg text-gray-600">
            Alles was Sie über schach.studio wissen müssen – von Funktionen über Preise bis zu Sicherheit und Migration.
          </p>
        </div>

        <div className="space-y-12">
          {/* Allgemeine Fragen */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Allgemeine Fragen</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="was-ist">
                <AccordionTrigger className="text-left">
                  Was ist "schach.studio"?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    schach.studio ist eine cloudbasierte Software-as-a-Service (SaaS) Plattform, die speziell für die Bedürfnisse von Schachvereinen entwickelt wurde. Sie vereint Mitgliederverwaltung, Turnierorganisation, Partiedatenbank und öffentliche Vereinswebsite in einem modernen System.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vereinsgroessen">
                <AccordionTrigger className="text-left">
                  Für welche Vereinsgrößen ist die Software geeignet?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Software skaliert von kleinen Vereinen mit 20 Mitgliedern bis zu großen Vereinen mit 500+ Mitgliedern. Alle Funktionen sind unabhängig von der Mitgliederzahl verfügbar.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="preise">
                <AccordionTrigger className="text-left">
                  Was kostet die Software?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Die Preisgestaltung orientiert sich an der Vereinsgröße:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4">Vereinsgröße</th>
                          <th className="text-left py-2 pr-4">Monatlicher Preis</th>
                          <th className="text-left py-2">Jahrespreis</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4">Bis 50 Mitglieder</td>
                          <td className="py-2 pr-4">29 €</td>
                          <td className="py-2">290 € (2 Monate gratis)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pr-4">51–150 Mitglieder</td>
                          <td className="py-2 pr-4">49 €</td>
                          <td className="py-2">490 € (2 Monate gratis)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pr-4">151–300 Mitglieder</td>
                          <td className="py-2 pr-4">79 €</td>
                          <td className="py-2">790 € (2 Monate gratis)</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">Über 300 Mitglieder</td>
                          <td className="py-2 pr-4">Auf Anfrage</td>
                          <td className="py-2">Auf Anfrage</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Alle Preise verstehen sich zzgl. MwSt. Eine 30-tägige kostenlose Testphase ist verfügbar.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="testversion">
                <AccordionTrigger className="text-left">
                  Gibt es eine kostenlose Testversion?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, Sie können die Software 30 Tage lang kostenlos und unverbindlich testen. In dieser Zeit stehen alle Funktionen zur Verfügung. Eine Kreditkarte ist für die Registrierung nicht erforderlich.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="kuendigung">
                <AccordionTrigger className="text-left">
                  Kann ich mein bestehendes Abo jederzeit kündigen?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, Abos können jederzeit zum Ende der laufenden Periode gekündigt werden. Bei monatlicher Zahlung erfolgt die Kündigung zum Monatsende, bei jährlicher Zahlung zum Ende des Vertragsjahres.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Funktionen & Features */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Funktionen & Features</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="kernfunktionen">
                <AccordionTrigger className="text-left">
                  Welche Kernfunktionen sind enthalten?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Mitgliederverwaltung:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Vollständige Mitgliederdatenbank mit Kontaktdaten</li>
                        <li>DWZ/Elo-Tracking pro Mitglied</li>
                        <li>Rollen und Berechtigungen (Admin, Vorstand, Sportwart, Jugendwart, Kassenwart, Trainer, Mitglied)</li>
                        <li>CSV-Import/Export für Migration und Verbandsmeldungen</li>
                        <li>Familienverknüpfungen (Eltern-Kind-Zuordnungen)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Turnierverwaltung:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Rundenturniere mit automatischer Paarungsgenerierung</li>
                        <li>Schweizer System (über Integration mit bbpPairings/JaVaFo)</li>
                        <li>Ergebniserfassung und automatische Ranglisten</li>
                        <li>TRF-Import aus SwissChess/ChessResults</li>
                        <li>Druckbare Paarungslisten und Ergebnislisten</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Mannschaftskampf:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Mannschaftsverwaltung mit Brettreihenfolgen</li>
                        <li>Ligabetrieb mit Spieltagen und Saisonübersicht</li>
                        <li>Ergebniserfassung pro Brett</li>
                        <li>Spielerverfügbarkeit</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Partiedatenbank:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>PGN-Import und -Export</li>
                        <li>Interaktiver PGN-Viewer mit Nachspielfunktion</li>
                        <li>Durchsuchbare Partiedatenbank (Spieler, Eröffnung, Ergebnis)</li>
                        <li>Verknüpfung von Partien mit Turnieren</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Öffentliche Website:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Vereinspräsentation mit Logo und Beschreibung</li>
                        <li>Terminkalender für Training und Turniere</li>
                        <li>Mannschaftsübersicht und Liga-Zugehörigkeit</li>
                        <li>News und Aktuelles</li>
                        <li>Impressum und Datenschutz (DSGVO-konform)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Kommunikation:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Rundmails an Gruppen (alle, Mannschaft X, Jugend etc.)</li>
                        <li>Benachrichtigungen für Termine und Ergebnisse</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="beitragsverwaltung">
                <AccordionTrigger className="text-left">
                  Ist eine Beitragsverwaltung enthalten?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Ja, die Beitragsverwaltung ist in allen Tarifen enthalten:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Flexible Beitragsmodelle (Erwachsene, Jugend, Familie, Ermäßigt)</li>
                    <li>Automatische Zuordnung basierend auf Alter/Status</li>
                    <li>Zahlungsstatus pro Mitglied und Jahr</li>
                    <li>SEPA-XML-Export für Lastschriftdateien</li>
                    <li>Rechnungs-PDF (automatisch erzeugbar)</li>
                    <li>Optionale Online-Zahlung via Stripe/Mollie</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="wordpress-ersatz">
                <AccordionTrigger className="text-left">
                  Können wir unsere bestehende WordPress-Website ersetzen?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, die Software beinhaltet eine vollständige öffentliche Website, die Ihre bestehende WordPress-Seite ersetzen kann. Alle wichtigen Inhalte (Vorstellung, Termine, Mannschaften, News) können abgebildet werden. Ein Import bestehender Inhalte ist möglich.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mobile-app">
                <AccordionTrigger className="text-left">
                  Gibt es eine mobile App?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Software ist als Progressive Web App (PWA) verfügbar und kann auf Smartphones und Tablets wie eine native App installiert werden. Sie funktioniert offline-fähig für grundlegende Funktionen wie Ergebniseingabe. Eine native App für iOS/Android ist derzeit nicht geplant.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="selbst-registrierung">
                <AccordionTrigger className="text-left">
                  Können Mitglieder sich selbst registrieren?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Nein, aus Datenschutzgründen erfolgt die Registrierung nur durch Einladung des Vorstands. Mitglieder erhalten einen Einladungslink per E-Mail und können sich dann mit E-Mail und Passwort registrieren. Optional ist ein Login über Lichess möglich.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mehrsprachig">
                <AccordionTrigger className="text-left">
                  Ist das System mehrsprachig?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Oberfläche ist aktuell auf Deutsch verfügbar. Englisch ist in Planung. Bei Bedarf können wir für größere Vereine weitere Sprachen priorisiert implementieren.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sicherheit & Datenschutz */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Sicherheit & Datenschutz</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="daten-speicherung">
                <AccordionTrigger className="text-left">
                  Wo werden die Daten gespeichert?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Alle Daten werden auf Servern in Deutschland gehostet (Hetzner Cloud). Die Server befinden sich in Rechenzentren mit ISO 27001-Zertifizierung.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dsgvo">
                <AccordionTrigger className="text-left">
                  Ist die Software DSGVO-konform?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Ja, die Software wurde mit Fokus auf DSGVO-Anforderungen entwickelt:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Hosting ausschließlich in der EU (Deutschland)</li>
                    <li>Auftragsverarbeitungsverträge (AVV) mit allen Dienstleistern</li>
                    <li>Rollen- und Rechtesystem mit granularer Zugriffskontrolle</li>
                    <li>Audit-Log zur Protokollierung aller Datenänderungen</li>
                    <li>Verschlüsselte Backups</li>
                    <li>Löschkonzept mit automatischen Löschfristen</li>
                    <li>Einwilligungsverwaltung für Fotos, Newsletter, Ergebnisveröffentlichung</li>
                    <li>Getrennte Zugriffsrechte für Jugenddaten (wichtig bei minderjährigen Mitgliedern)</li>
                    <li>Datenschutzerklärung auf der öffentlichen Website</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="passwoerter">
                <AccordionTrigger className="text-left">
                  Wie werden Passwörter gespeichert?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Passwörter werden mit bcrypt gehasht und gesalzen gespeichert. Im Produktivbetrieb ist die Zwei-Faktor-Authentifizierung (2FA) für Admin-Rollen verpflichtend.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="zugriff">
                <AccordionTrigger className="text-left">
                  Wer hat Zugriff auf die Daten?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Der Zugriff erfolgt über ein rollenbasiertes Berechtigungssystem:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Admin</strong>: Vollzugriff auf alle Systemeinstellungen</li>
                    <li><strong>Vorstand</strong>: Vollzugriff auf Vereinsdaten</li>
                    <li><strong>Sportwart</strong>: Turnier- und Mannschaftsverwaltung</li>
                    <li><strong>Jugendwart</strong>: Zugriff auf Jugendmitglieder</li>
                    <li><strong>Kassenwart</strong>: Beitrags- und Finanzdaten</li>
                    <li><strong>Trainer</strong>: Zugriff auf Trainingsgruppen</li>
                    <li><strong>Mitglied</strong>: Eigene Daten, öffentliche Bereiche</li>
                    <li><strong>Eltern-Zugang</strong>: Nur eigene Kinder (bei Jugendspielern)</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Jeder Verein verwaltet seine Daten isoliert. Es gibt keinen Zugriff durch andere Vereine oder Dritte.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="backups">
                <AccordionTrigger className="text-left">
                  Werden Backups erstellt?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, es werden tägliche automatische Backups der Datenbank erstellt. Die Backups werden verschlüsselt gespeichert und 30 Tage vorgehalten. Auf Anfrage kann ein manueller Backup-Export bereitgestellt werden.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="daten-bei-kuendigung">
                <AccordionTrigger className="text-left">
                  Was passiert mit den Daten bei Kündigung?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Bei Kündigung Ihres Abos erhalten Sie einen vollständigen Datenexport im CSV-Format (Mitglieder, Turniere, Partien). Anschließend werden alle Daten gemäß DSGVO gelöscht, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Technik & Integration */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Technik & Integration</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="voraussetzungen">
                <AccordionTrigger className="text-left">
                  Welche technischen Voraussetzungen benötigen wir?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Keine. Die Software läuft vollständig im Browser. Sie benötigen lediglich:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Einen modernen Webbrowser (Chrome, Firefox, Safari, Edge)</li>
                    <li>Eine Internetverbindung</li>
                    <li>Keine Installation auf einzelnen Rechnern</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="import">
                <AccordionTrigger className="text-left">
                  Können wir Daten aus unserer alten Software importieren?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Ja, Import-Funktionen sind für folgende Quellen verfügbar:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Excel/CSV</strong>: Mitgliederlisten, Kontaktlisten</li>
                    <li><strong>SwissChess/ChessResults</strong>: Turnierdaten via TRF-Format</li>
                    <li><strong>PGN-Sammlungen</strong>: Bulk-Import von Partiedateien</li>
                    <li><strong>DeWIS</strong>: DWZ-Daten synchronisierbar</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Bei speziellen Anforderungen unterstützen wir Sie gerne bei der Migration.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lichess">
                <AccordionTrigger className="text-left">
                  Gibt es eine Schnittstelle zu Lichess?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, folgende Lichess-Integrationen sind verfügbar:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Login mit Lichess-Konto (OAuth)</li>
                    <li>Verknüpfung von Lichess-Profilen mit Mitgliedern</li>
                    <li>Import von Online-Turnierergebnissen (geplant)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="self-hosting">
                <AccordionTrigger className="text-left">
                  Können wir die Software auf unserem eigenen Server betreiben?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, auf Anfrage ist eine Self-Hosting-Variante als Docker-Container verfügbar. Dies ist besonders für Vereine interessant, die aus Compliance-Gründen die Infrastruktur selbst kontrollieren müssen. Die Self-Hosting-Lizenz ist separat lizenziert.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="updates">
                <AccordionTrigger className="text-left">
                  Wie oft gibt es Updates?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Software wird kontinuierlich weiterentwickelt. Neue Features werden in der Regel alle 2–4 Wochen ausgerollt. Sicherheitsupdates erfolgen umgehend. Downtime während Updates beträgt in der Regel weniger als 5 Minuten.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ausfallsicher">
                <AccordionTrigger className="text-left">
                  Ist das System ausfallsicher?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Infrastruktur ist mit automatischem Failover ausgelegt. Die garantierte Verfügbarkeit beträgt 99,5% pro Jahr. Geplante Wartungsfenster werden mindestens 48 Stunden im Voraus angekündigt.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Support & Schulung */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Support & Schulung</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="support-erreichen">
                <AccordionTrigger className="text-left">
                  Wie erreichen wir den Support?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Der Support ist während der Geschäftszeiten (Mo–Fr, 9–17 Uhr) erreichbar:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
                    <li>E-Mail: support@schach.studio</li>
                    <li>Antwortzeit: Innerhalb von 24 Stunden an Werktagen</li>
                    <li>Bei dringenden Problemen: Priorisierter Support für größere Vereine</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schulung">
                <AccordionTrigger className="text-left">
                  Gibt es eine Einarbeitung oder Schulung?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Ja, für neue Kunden bieten wir:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>Ausführliche Dokumentation und Video-Tutorials</li>
                    <li>Onboarding-Call (30 Minuten) zur Einrichtung</li>
                    <li>Auf Anfrage: Individuelle Schulung für den Vorstand (separat berechenbar)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="feature-wuensche">
                <AccordionTrigger className="text-left">
                  Können wir Feature-Wünsche einreichen?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, Kunden können jederzeit Feature-Wünsche über das Support-Portal einreichen. Die Umsetzung wird priorisiert basierend auf:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
                    <li>Anzahl der Anfragen</li>
                    <li>Allgemeiner Nutzen für die Zielgruppe</li>
                    <li>Technischer Aufwand</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Kritische Bugs werden selbstverständlich priorisiert behoben.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Migration & Einführung */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Migration & Einführung</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="einrichtung-dauer">
                <AccordionTrigger className="text-left">
                  Wie lange dauert die Einrichtung?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Die technische Einrichtung ist in weniger als 1 Stunde abgeschlossen:
                  </p>
                  <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-4">
                    <li>Konto erstellen und Verein anlegen</li>
                    <li>Mitglieder per CSV importieren</li>
                    <li>Einladungsmails versenden</li>
                    <li>Website anpassen (Logo, Beschreibung, Termine)</li>
                  </ol>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    In der Praxis empfehlen wir 2–4 Wochen für die vollständige Einführung, um dem Vorstand Zeit für die Einarbeitung zu geben.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parallel-betrieb">
                <AccordionTrigger className="text-left">
                  Können Mitglieder während der Umstellung parallel weiterarbeiten?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, die Software kann parallel zu bestehenden Systemen betrieben werden. Ein paralleler Betrieb ist für eine Übergangsphase von 1–3 Monaten empfehlenswert.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="umstellung-beachten">
                <AccordionTrigger className="text-left">
                  Was müssen wir bei der Umstellung beachten?
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li><strong>Datenqualität</strong>: Prüfen Sie Ihre bestehenden Mitgliederlisten auf Aktualität</li>
                    <li><strong>Einwilligungen</strong>: Dokumentieren Sie Einwilligungen für Newsletter und Foto-Veröffentlichung</li>
                    <li><strong>Kommunikation</strong>: Informieren Sie Mitglieder frühzeitig über den Wechsel</li>
                    <li><strong>Ansprechpartner</strong>: Benennen Sie 1–2 Personen im Verein, die als Multiplikatoren dienen</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="neue-passwoerter">
                <AccordionTrigger className="text-left">
                  Müssen unsere Mitglieder neue Passwörter erstellen?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, aus Sicherheitsgründen muss jedes Mitglied sein Passwort selbst setzen. Dies erfolgt über den Einladungslink, der per E-Mail versendet wird.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Zahlung & Vertrag */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Zahlung & Vertrag</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="bezahlmethoden">
                <AccordionTrigger className="text-left">
                  Wie kann ich bezahlen?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Zahlung erfolgt bequem per:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
                    <li>SEPA-Lastschrift (monatlich oder jährlich)</li>
                    <li>Überweisung (jährlich)</li>
                    <li>Kreditkarte (in Planung)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="versteckte-kosten">
                <AccordionTrigger className="text-left">
                  Gibt es versteckte Kosten?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Nein. Der angegebene Preis beinhaltet alle Funktionen, Hosting, Support und Updates. Es fallen keine zusätzlichen Kosten an.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="upgrade">
                <AccordionTrigger className="text-left">
                  Können wir das Abo später upgraden?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, bei Mitgliederzuwachs kann das Abo jederzeit auf die nächste Stufe upgegradet werden. Die Abrechnung erfolgt anteilig pro Monat.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rabatte">
                <AccordionTrigger className="text-left">
                  Gibt es Rabatte für neue Vereine oder Jugendarbeit?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, Vereine mit überwiegend jugendlichen Mitgliedern (&gt;50% unter 18) erhalten 20% Rabatt. Neue Vereine im ersten Gründungsjahr erhalten den ersten Jahrespreis gratis.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sonstige Fragen */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Sonstige Fragen</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="entwickler">
                <AccordionTrigger className="text-left">
                  Wer entwickelt die Software?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Software wird von einem erfahrenen Softwareentwickler mit Schach-Hintergrund entwickelt. Der Fokus liegt auf langfristiger, zuverlässiger Betreuung ohne Venture-Capital-Druck.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="insolvenz">
                <AccordionTrigger className="text-left">
                  Was passiert, wenn der Anbieter insolvent geht?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Die Software ist als Open-Source-Projekt angelegt. Im unwahrscheinlichen Fall einer Einstellung des Betriebs können Kunden die Software auf eigenen Servern weiterbetreiben (Self-Hosting-Lizenz ist im Abo enthalten).
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="demo">
                <AccordionTrigger className="text-left">
                  Gibt es eine Demo-Umgebung?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Ja, auf Anfrage stellen wir gerne Zugang zu einer Demo-Umgebung mit Testdaten bereit. So können Sie die Software in Ruhe erkunden, bevor Sie sich entscheiden.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="anmeldung">
                <AccordionTrigger className="text-left">
                  Wie melde ich mich an?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 leading-relaxed">
                    Besuchen Sie <a href="/" className="text-primary hover:underline">schach.studio</a> und klicken Sie auf "Kostenlos testen". Nach der Registrierung erhalten Sie umgehend Zugang.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Weiterführende Links */}
        <div className="mt-16 p-8 bg-slate-50 rounded-xl border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Weiterführende Links
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/preise" className="text-primary hover:underline flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Preise
              </a>
            </li>
            <li>
              <a href="/kontakt" className="text-primary hover:underline flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Kontakt
              </a>
            </li>
            <li>
              <a href="/datenschutz" className="text-primary hover:underline flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Datenschutz
              </a>
            </li>
            <li>
              <a href="/impressum" className="text-primary hover:underline flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Impressum
              </a>
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-6">
            <strong>Letzte Aktualisierung:</strong> April 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
