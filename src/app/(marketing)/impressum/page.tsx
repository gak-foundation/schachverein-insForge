import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum | schach.studio",
  description: "Impressum und rechtliche Informationen zu schach.studio",
  alternates: {
    canonical: "/impressum",
  },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">Angaben gemäß § 5 TMG</h2>
            
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="mb-2"><strong>[Firma / Name]</strong></p>
              <p className="mb-2">[Straße und Hausnummer]</p>
              <p className="mb-2">[PLZ Ort]</p>
              <p className="mb-2">Deutschland</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="mb-2">Telefon: [Telefonnummer]</p>
              <p className="mb-2">E-Mail: <a href="mailto:kontakt@schach.studio" className="text-primary hover:underline">kontakt@schach.studio</a></p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Vertretungsberechtigter</h2>
            <p className="mb-4">
              Vertreten durch: [Name des Geschäftsführers/Inhabers]
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Umsatzsteuer-ID</h2>
            <p className="mb-4">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <br />
              [USt-IdNr.]
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="mb-2">[Name]</p>
              <p className="mb-2">[Adresse]</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">EU-Streitschlichtung</h2>
            <p className="mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>.
            </p>
            <p className="mb-4">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p className="mb-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Haftung für Inhalte</h2>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Haftung für Links</h2>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <p className="text-sm">
                <strong>Hinweis:</strong> Dies ist ein Platzhalter-Impressum. Bitte füllen Sie die in eckigen Klammern 
                stehenden Daten mit Ihren tatsächlichen Unternehmensdaten aus, bevor Sie die Website veröffentlichen.
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
