export const metadata = {
  title: "Datenschutz",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Datenschutz auf einen Blick</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
            wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Datenerfassung auf dieser Website</h3>
          <p>
            <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
            Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <p>
            <strong>Wie erfassen wir Ihre Daten?</strong><br />
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. 
            Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
          </p>

          <p>
            <strong>Wofür nutzen wir Ihre Daten?</strong><br />
            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
            Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Allgemeine Hinweise und Pflichtinformationen</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Datenschutz</h3>
          <p>
            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
            Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften 
            sowie dieser Datenschutzerklärung.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
          <p>
            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p className="pl-4 border-l-2 border-gray-300 my-4">
            Schachverein Musterstadt e.V.<br />
            Max Mustermann<br />
            Musterstraße 123<br />
            12345 Musterstadt
          </p>
          <p>
            Telefon: +49 123 4567890<br />
            E-Mail: info@schachverein.de
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
          <p>
            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. 
            Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. 
            Dazu reicht eine formlose Mitteilung per E-Mail an uns. 
            Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung (Art. 21 DSGVO)</h3>
          <p>
            Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, 
            haben Sie jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, 
            gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Datenerfassung auf dieser Website</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
          <p>
            Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datensätze, 
            die auf Ihrem Endgerät gespeichert werden und die Ihr Browser speichert. 
            Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
          </p>
          <p>
            Einige Cookies sind „technisch notwendig“, da sie ermöglichen, unsere Website zu nutzen 
            (z.B. für die Anmeldung im Mitgliederbereich). Diese Cookies werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Server-Log-Dateien</h3>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, 
            die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Registrierung / Mitgliedschaft</h3>
          <p>
            Auf unserer Website bieten wir Ihnen die Möglichkeit, sich als Mitglied zu registrieren 
            bzw. im Mitgliederbereich anzumelden. Die dabei erhobenen Daten umfassen:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Name, Vorname</li>
            <li>E-Mail-Adresse</li>
            <li>Telefonnummer (optional)</li>
            <li>Geburtsdatum (optional)</li>
            <li>Spielstärke (DWZ/Elo, optional)</li>
          </ul>
          <p>
            Diese Daten werden für die Mitgliederverwaltung und Organisation von Turnieren und Mannschaftskämpfen verwendet.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Analyse-Tools</h2>
          <p>
            Wir setzen derzeit keine Analyse-Tools wie Google Analytics ein. 
            Falls wir in Zukunft solche Tools verwenden, werden wir diese Datenschutzerklärung entsprechend aktualisieren.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Ihre Rechte</h2>
          <p>Sie haben das Recht:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten</li>
            <li>Berichtigung unrichtiger Daten zu verlangen</li>
            <li>Löschung Ihrer Daten zu verlangen (soweit dem keine gesetzlichen Aufbewahrungspflichten entgegenstehen)</li>
            <li>Einschränkung der Verarbeitung zu verlangen</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerspruch gegen die Verarbeitung einzulegen</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Änderungen dieser Datenschutzerklärung</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht 
            oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. 
            Für Ihren erneuten Besuch gilt die jeweils aktuelle Datenschutzerklärung.
          </p>
        </div>

        <p className="text-gray-500 mt-12">
          Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}
