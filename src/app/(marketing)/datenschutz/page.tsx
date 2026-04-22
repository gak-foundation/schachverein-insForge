import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | schach.studio",
  description: "Datenschutzerklärung und Informationen zum Datenschutz bei schach.studio",
  alternates: {
    canonical: "/datenschutz",
  },
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Datenschutz auf einen Blick</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Allgemeine Hinweise</h3>
            <p className="mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
              persönlich identifiziert werden können.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Datenerfassung auf dieser Website</h3>
            <p className="mb-4">
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
            </p>
            <p className="mb-4">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
              können Sie dem Impressum dieser Website entnehmen.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Wie erfassen wir Ihre Daten?</h3>
            <p className="mb-4">
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. bei der Registrierung 
              oder Kontaktaufnahme). Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme 
              erfasst (z.B. IP-Adresse, Browser-Typ, Betriebssystem).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Wofür nutzen wir Ihre Daten?</h3>
            <p className="mb-4">
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
              Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Hosting und Content Delivery Networks (CDN)</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Externes Hosting</h3>
            <p className="mb-4">
              Diese Website wird bei einem externen Dienstleister gehostet (Hosting-Provider). Die personenbezogenen 
              Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. 
              Dies kann insbesondere IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, 
              Kontaktdaten, Namen, Websitezugriffe und sonstige Daten über eine Website umfassen.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Datenschutz</h3>
            <p className="mb-4">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
              Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften 
              sowie dieser Datenschutzerklärung.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
            <p className="mb-4">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="mb-2"><strong>[Name/Firma]</strong></p>
              <p className="mb-2">[Straße und Hausnummer]</p>
              <p className="mb-2">[PLZ Ort]</p>
              <p className="mb-2">Telefon: [Telefonnummer]</p>
              <p className="mb-2">E-Mail: kontakt@schach.studio</p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p className="mb-4">
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. 
              Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit 
              der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen</h3>
            <p className="mb-4">
              WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO ERFOLGT, 
              HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN, 
              GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH EINZULEGEN.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Recht auf Datenübertragbarkeit</h3>
            <p className="mb-4">
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines 
              Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, 
              maschinenlesbaren Format aushändigen zu lassen.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Datenerfassung auf dieser Website</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
            <p className="mb-4">
              Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datenpakete und 
              richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer 
              einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Server-Log-Dateien</h3>
            <p className="mb-4">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Anfrage per E-Mail, Telefon oder Telefax</h3>
            <p className="mb-4">
              Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive aller 
              daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres 
              Anliegens bei uns gespeichert und verarbeitet.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Plugins und Tools</h2>

            <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <p className="text-sm">
                <strong>Hinweis:</strong> Dies ist eine Muster-Datenschutzerklärung. Bitte füllen Sie die in 
                eckigen Klammern stehenden Daten mit Ihren tatsächlichen Unternehmensdaten aus und passen Sie 
                die Erklärung an Ihre spezifischen Datenverarbeitungsprozesse an, bevor Sie die Website veröffentlichen.
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
