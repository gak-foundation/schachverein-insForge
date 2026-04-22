import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erklärung zur Barrierefreiheit | schach.studio",
  description: "Informationen zur Barrierefreiheit von schach.studio gemäß BFSG",
};

export default function BarrierefreiheitPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Erklärung zur Barrierefreiheit</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="mb-6 text-muted-foreground">
              Diese Erklärung zur Barrierefreiheit gilt für die Website schach.studio 
              und wurde am {new Date().toLocaleDateString('de-DE')} erstellt.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Unser Engagement</h2>
            <p className="mb-4">
              schach.studio ist bestrebt, seine Website und Dienste für alle Menschen zugänglich zu machen, 
              unabhängig von physischen oder technischen Einschränkungen. Wir folgen den Richtlinien der 
              <strong> Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong>.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Stand der Vereinbarkeit</h2>
            <p className="mb-4">
              Diese Website ist mit den Anforderungen der WCAG 2.2 Level AA größtenteils vereinbar. 
              Wir arbeiten kontinuierlich daran, alle Bereiche der Website zu optimieren.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Bereits umgesetzte Features:</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Vollständige Tastaturbedienbarkeit aller Funktionen</li>
              <li>Klare Überschriftenstruktur (H1-H6) für Screenreader</li>
              <li>Alternative Texte für alle Bilder</li>
              <li>Ausreichender Kontrast (mindestens 4.5:1 für Text)</li>
              <li>Responsives Design für alle Bildschirmgrößen</li>
              <li>Fokus-Indikatoren für interaktive Elemente</li>
              <li>ARIA-Labels für komplexe Komponenten</li>
              <li>Verzicht auf blinkende oder flackernde Inhalte</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Nicht barrierefreie Inhalte</h2>
            <p className="mb-4">
              Aufgrund der aktuellen Entwicklung können einige ältere Bereiche oder externe Einbindungen 
              noch nicht vollständig barrierefrei sein. Wir bemühen uns, diese so schnell wie möglich anzupassen.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">Bekannte Einschränkungen:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Einige PDF-Dokumente (Download-Bereich) sind noch nicht vollständig getaggt</li>
                <li>Externe eingebettete Videos (YouTube) unterliegen den Zugänglichkeitsrichtlinien des Anbieters</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Feedback und Kontakt</h2>
            <p className="mb-4">
              Sollten Sie Barrieren auf unserer Website feststellen oder Verbesserungsvorschläge haben, 
              kontaktieren Sie uns bitte. Wir nehmen Ihr Feedback ernst und arbeiten daran, 
              alle gemeldeten Probleme zeitnah zu beheben.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2 text-primary">Kontakt zur Barrierefreiheit:</h3>
              <p className="mb-1">E-Mail: <a href="mailto:barrierefreiheit@schach.studio" className="text-primary hover:underline">barrierefreiheit@schach.studio</a></p>
              <p>Postadresse: Siehe Impressum</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Durchsetzungsverfahren</h2>
            <p className="mb-4">
              Sollten Sie von uns keine zufriedenstellende Antwort erhalten haben, können Sie sich 
              an die Schlichtungsstelle BFSG wenden:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="mb-1"><strong>Schlichtungsstelle BFSG</strong></p>
              <p className="mb-1">beim Beauftragten der Bundesregierung für die Belange von Menschen mit Behinderungen</p>
              <p className="mb-1">Mauerstraße 53</p>
              <p className="mb-1">10117 Berlin</p>
              <p className="mb-1">Telefon: 030 18 527 0</p>
              <p className="mb-1">E-Mail: <a href="mailto:info@schlichtungsstelle-bfsg.de" className="text-primary hover:underline">info@schlichtungsstelle-bfsg.de</a></p>
              <p>Webseite: <a href="https://www.schlichtungsstelle-bfsg.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.schlichtungsstelle-bfsg.de</a></p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Technische Grundlagen</h2>
            <p className="mb-4">
              Unsere Website basiert auf den folgenden Technologien:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>HTML5 und CSS3 gemäß W3C-Standards</li>
              <li>JavaScript für erweiterte Interaktivität</li>
              <li>ARIA-Attribute zur Unterstützung von assistiven Technologien</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Geprüfte Software</h2>
            <p className="mb-4">
              Unsere Website wurde mit folgenden Tools auf Barrierefreiheit getestet:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Lighthouse Accessibility Audit</li>
              <li>axe DevTools</li>
              <li>WAVE (Web Accessibility Evaluation Tool)</li>
              <li>Manuelle Tests mit Screenreadern (NVDA, JAWS)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Regelmäßige Überprüfung</h2>
            <p className="mb-4">
              Diese Erklärung wird regelmäßig überprüft und bei Bedarf aktualisiert. 
              Die letzte Überprüfung erfolgte am {new Date().toLocaleDateString('de-DE')}.
            </p>

            <div className="mt-12 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
              <p className="text-sm">
                <strong>Hinweis:</strong> Wir setzen uns kontinuierlich dafür ein, unsere Website 
                für alle Nutzer zugänglich zu machen. Wenn Sie Vorschläge zur Verbesserung der 
                Barrierefreiheit haben, kontaktieren Sie uns bitte.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-primary hover:underline">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
