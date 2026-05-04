"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CreditCard, GraduationCap, HelpCircle, LifeBuoy, Package, Shield, Wrench } from "lucide-react";

export interface FAQSection {
  title: string;
  icon: LucideIcon;
  questions: {
    question: string;
    answer: string;
  }[];
}

const defaultFaqs = [
  {
    question: "Was bedeutet barrierefrei nach WCAG 2.2 AA umgesetzt?",
    answer:
      "Wir haben unsere Software nach den Web Content Accessibility Guidelines (WCAG) 2.2 auf Level AA umgesetzt. Das bedeutet: ausreichender Kontrast, Tastaturbedienbarkeit, klare Sprache und kompatibel mit Screenreadern. Bereit für das Barrierefreiheitsstärkungsgesetz (BFSG) ab 2025.",
  },
  {
    question: "Wie funktioniert das Preismodell?",
    answer:
      "Die Nutzung unserer Plattform ist für alle Vereine dauerhaft kostenfrei. Es gibt keine Mitgliederlimits, keine versteckten Kosten und keine Abomodelle. Wir möchten den Schachsport unterstützen und die Vereinsverwaltung so einfach und zugänglich wie möglich machen.",
  },
  {
    question: "Kann ich meine bestehenden Daten importieren?",
    answer:
      "Ja, wir unterstützen den Import aus gängigen Vereinsverwaltungen. Sie können Mitgliederdaten als CSV oder Excel-Datei hochladen. Bei größeren Datenmengen helfen wir Ihnen gerne persönlich beim Import.",
  },
  {
    question: "Wo werden meine Daten gespeichert?",
    answer:
      "Alle Daten werden auf Servern in Deutschland gespeichert. Wir arbeiten mit deutschen Cloud-Anbietern und Hetzner zusammen, um DSGVO-Konformität und schnelle Ladezeiten zu garantieren. Wir haben keinen Zugriff auf Ihre Daten.",
  },
  {
    question: "Wie sicher ist die Software?",
    answer:
      "Wir setzen auf moderne Sicherheitsstandards: Verschlüsselte Datenübertragung (TLS 1.3), regelmäßige Backups, Zwei-Faktor-Authentifizierung und rollenbasierte Zugriffsrechte. Unser Code wird regelmäßig auf Sicherheitslücken geprüft.",
  },
  {
    question: "Benötigen meine Mitglieder eine App?",
    answer:
      "Nein, schach.studio ist eine Progressive Web App (PWA). Das bedeutet: Ihre Mitglieder können die Software einfach im Browser nutzen und bei Bedarf auf den Home-Bildschirm ihres Smartphones hinzufügen — ohne App-Store und ohne Updates manuell installieren zu müssen.",
  },
  {
    question: "Wie lange dauert die Einrichtung?",
    answer:
      "Die grundlegende Einrichtung dauert etwa 15 Minuten. Damit sind Vereinsdaten, erste Mitglieder und Termine erfasst. Für komplexere Setups mit Finanzmodul und Website empfehlen wir eine Stunde.",
  },
  {
    question: "Gibt es einen Support?",
    answer:
      "Ja, alle Pläne beinhalten E-Mail-Support. Pro-Nutzer erhalten zusätzlich priorisierten Support mit schnelleren Antwortzeiten. Für spezielle Anforderungen bieten wir auch Einzelschulungen an.",
  },
];

export const detailedFAQ: FAQSection[] = [
  {
    title: "Allgemeine Fragen",
    icon: HelpCircle,
    questions: [
      {
        question: "Was ist schach.studio?",
        answer:
          "schach.studio ist eine cloudbasierte Software-as-a-Service (SaaS) Plattform, die speziell für die Bedürfnisse von Schachvereinen entwickelt wurde. Sie vereint Mitgliederverwaltung, Turnierorganisation, Partiedatenbank, Mannschaftskampf, Finanzverwaltung und eine öffentliche Vereinswebsite in einem modernen System.",
      },
      {
        question: "Für welche Vereinsgrößen ist die Software geeignet?",
        answer:
          "Die Software skaliert von kleinen Vereinen mit 20 Mitgliedern bis zu großen Vereinen mit 500+ Mitgliedern. Alle Funktionen sind unabhängig von der Mitgliederzahl verfügbar.",
      },
      {
        question: "Gibt es eine kostenlose Testversion?",
        answer:
          "Ja, Sie können die Software 30 Tage lang kostenlos und unverbindlich testen. In dieser Zeit stehen alle Funktionen zur Verfügung. Eine Kreditkarte ist für die Registrierung nicht erforderlich.",
      },
      {
        question: "Kann ich mein bestehendes Abo jederzeit kündigen?",
        answer:
          "Ja, Abos können jederzeit zum Ende der laufenden Periode gekündigt werden. Bei monatlicher Zahlung erfolgt die Kündigung zum Monatsende, bei jährlicher Zahlung zum Ende des Vertragsjahres.",
      },
      {
        question: "Wer steckt hinter schach.studio?",
        answer:
          "Wir sind ein kleines Team aus leidenschaftlichen Schachspielern und Softwareentwicklern mit Sitz in Deutschland. Unser Ziel ist es, die Vereinsverwaltung für Schachvereine so einfach und effizient wie möglich zu gestalten.",
      },
    ],
  },
  {
    title: "Funktionen & Features",
    icon: Package,
    questions: [
      {
        question: "Welche Kernfunktionen sind enthalten?",
        answer:
          "Die Software umfasst: Mitgliederverwaltung mit DWZ/Elo-Tracking, Turnierverwaltung (Rundenturniere, Schweizer System), Mannschaftskampf mit Ligabetrieb, Partiedatenbank mit PGN-Viewer, Beitrags- und Zahlungsverwaltung, eine öffentliche Vereinswebsite, Kommunikationswerkzeuge (Rundmails, Benachrichtigungen) und einen Terminkalender mit Export-Funktion.",
      },
      {
        question: "Ist eine Beitragsverwaltung enthalten?",
        answer:
          "Ja, die Beitragsverwaltung ist in allen Tarifen enthalten: flexible Beitragsmodelle (Erwachsene, Jugend, Familie, Ermäßigt), automatische Zuordnung basierend auf Alter/Status, Zahlungsstatus pro Mitglied und Jahr, SEPA-XML-Export für Lastschriftdateien, Rechnungs-PDF und optionale Online-Zahlung via Stripe.",
      },
      {
        question: "Können wir unsere bestehende WordPress-Website ersetzen?",
        answer:
          "Ja, die Software beinhaltet eine vollständige öffentliche Website mit Vereinspräsentation (Logo, Beschreibung), Terminkalender, Mannschaftsübersicht, News-Bereich, Impressum und Datenschutz – alles DSGVO-konform und SEO-optimiert.",
      },
      {
        question: "Gibt es eine mobile App?",
        answer:
          "Die Software ist als Progressive Web App (PWA) verfügbar und kann auf Smartphones und Tablets wie eine native App installiert werden. Sie funktioniert offline-fähig für grundlegende Funktionen wie Ergebniseingabe.",
      },
      {
        question: "Unterstützt die Software eine Selbstregistrierung für Mitglieder?",
        answer:
          "Ja, Mitglieder können sich selbst über eine persönliche Einladungs-E-Mail registrieren. Admins behalten die volle Kontrolle über Rollen und Berechtigungen.",
      },
      {
        question: "Ist die Software mehrsprachig?",
        answer:
          "Derzeit ist die Benutzeroberfläche auf Deutsch verfügbar. Weitere Sprachen sind für zukünftige Versionen geplant.",
      },
      {
        question: "Gibt es eine Partiedatenbank mit Analyse?",
        answer:
          "Ja, die Partiedatenbank unterstützt PGN-Import und -Export, einen interaktiven PGN-Viewer mit Nachspielfunktion sowie eine durchsuchbare Datenbank nach Spieler, Eröffnung und Ergebnis.",
      },
    ],
  },
  {
    title: "Sicherheit & Datenschutz",
    icon: Shield,
    questions: [
      {
        question: "Wo werden meine Daten gespeichert?",
        answer:
          "Alle Daten werden auf Servern in Deutschland gespeichert. Wir arbeiten mit deutschen Cloud-Anbietern und Hetzner zusammen, um DSGVO-Konformität und kurze Ladezeiten zu garantieren. Sie behalten die volle Datenhoheit.",
      },
      {
        question: "Ist die Software DSGVO-konform?",
        answer:
          "Ja, die Software wurde von Grund auf DSGVO-konform entwickelt. Dazu gehören: Auftragsverarbeitungsvertrag (AVV), Daten auf deutschen Servern, Recht auf Auskunft/Löschung, konfigurierbare Cookie-Einstellungen, DSGVO-konformes Impressum und Datenschutzerklärung.",
      },
      {
        question: "Wie werden Passwörter gespeichert?",
        answer:
          "Passwörter werden mit modernen, sicheren Hash-Verfahren gespeichert. Wir verwenden bcrypt mit einem hohen Cost-Faktor. Klartext-Passwörter werden zu keinem Zeitpunkt gespeichert oder übertragen.",
      },
      {
        question: "Gibt es rollenbasierte Zugriffsrechte?",
        answer:
          "Ja, Sie können detaillierte Rollen vergeben: Admin, Vorstand, Sportwart, Jugendwart, Kassenwart, Trainer und Mitglied. Jede Rolle hat spezifische Lese- und Schreibrechte.",
      },
      {
        question: "Werden Backups erstellt?",
        answer:
          "Ja, wir erstellen tägliche automatisierte Backups mit einer Aufbewahrungsdauer von 30 Tagen. Auf Wunsch können Sie jederzeit einen manuellen Export aller Ihrer Daten durchführen.",
      },
      {
        question: "Was passiert mit meinen Daten bei einer Kündigung?",
        answer:
          "Nach der Kündigung werden Ihre Daten für 90 Tage aufbewahrt, damit Sie diese exportieren können. Danach werden alle Daten vollständig und unwiderruflich gelöscht.",
      },
    ],
  },
  {
    title: "Technik & Einrichtung",
    icon: Wrench,
    questions: [
      {
        question: "Welche technischen Voraussetzungen werden benötigt?",
        answer:
          "Sie benötigen lediglich einen modernen Webbrowser (Chrome, Firefox, Edge, Safari). Es ist keine lokale Installation notwendig. Die Software läuft auf Windows, Mac, Linux und mobilen Geräten.",
      },
      {
        question: "Kann ich meine bestehenden Daten importieren?",
        answer:
          "Ja, wir unterstützen den Import aus gängigen Vereinsverwaltungen. Sie können Mitgliederdaten als CSV oder Excel-Datei hochladen. Für Daten aus SwissChess, ChessResults oder anderen Schach-Programmen bieten wir spezielle Import-Funktionen (z. B. TRF-Import für Turniere). Bei größeren Datenmengen helfen wir Ihnen gerne persönlich.",
      },
      {
        question: "Gibt es eine Lichess-Integration?",
        answer:
          "Ja, wir bieten eine Integration mit Lichess. Sie können Daten aus Lichess importieren und Turnierergebnisse synchronisieren. Eine Chess.com-Integration ist in Planung.",
      },
      {
        question: "Kann ich die Software selbst hosten?",
        answer:
          "Nein, schach.studio ist eine reine Cloud-Plattform. Das bedeutet: keine Server-Wartung, keine Updates – alles läuft automatisch. Sie können sich auf Ihren Verein konzentrieren.",
      },
      {
        question: "Wie lange dauert die Einrichtung?",
        answer:
          "Die grundlegende Einrichtung dauert etwa 15–30 Minuten. Damit sind Vereinsdaten, erste Mitglieder und Termine erfasst. Für komplexere Setups mit Finanzmodul und Website empfehlen wir ca. 90 Minuten.",
      },
      {
        question: "Wie werden Updates durchgeführt?",
        answer:
          "Updates werden automatisch und ohne Ausfallzeiten eingespielt. Sie müssen sich um nichts kümmern – die Software ist immer auf dem neuesten Stand.",
      },
      {
        question: "Wie hoch ist die Uptime?",
        answer:
          "Wir garantieren eine Verfügbarkeit von 99,9 % im Jahresmittel. Wartungsarbeiten werden im Voraus angekündigt und finden in der Regel nachts statt.",
      },
    ],
  },
  {
    title: "Preise & Vertrag",
    icon: CreditCard,
    questions: [
      {
        question: "Wie funktioniert das Preismodell?",
        answer:
          "Die Nutzung der Basisversion unserer Plattform ist für alle Vereine dauerhaft kostenfrei. Es gibt keinen Mitgliederlimits, keine versteckten Kosten und keine automatische Verlängerung. Für erweiterte Funktionen bieten wir faire Premium-Tarife an.",
      },
      {
        question: "Welche Zahlungsmethoden werden akzeptiert?",
        answer:
          "Wir akzeptieren SEPA-Lastschrift und Kreditkarte (Visa, Mastercard). Für Jahresabos bieten wir Rechnung auf Anfrage an.",
      },
      {
        question: "Gibt es versteckte Kosten?",
        answer:
          "Nein, es gibt keine versteckten Kosten. Alle Preise sind transparent auf unserer Preisseite aufgeführt.",
      },
      {
        question: "Gibt es Mitgliederlimits in den Tarifen?",
        answer:
          "Nein, es gibt keine Mitgliederlimits. Alle Funktionen stehen unabhängig von der Mitgliederzahl zur Verfügung.",
      },
      {
        question: "Warum ist die Software teilweise kostenlos?",
        answer:
          "Unser Ziel ist es, den Schachsport zu unterstützen und die digitale Vereinsverwaltung für alle Vereine zugänglich zu machen – unabhängig von ihrer finanziellen Situation. Die kostenpflichtigen Premium-Funktionen finanzieren die kostenfreie Basisversion.",
      },
    ],
  },
  {
    title: "Support & Schulung",
    icon: GraduationCap,
    questions: [
      {
        question: "Wie erreiche ich den Support?",
        answer:
          "Sie erreichen unseren Support per E-Mail unter support@schach.studio. Wir antworten innerhalb von 24 Stunden (werktags). Bei Premium-Tarifen bieten wir priorisierten Support mit kürzeren Antwortzeiten.",
      },
      {
        question: "Gibt es Schulungen oder Onboarding?",
        answer:
          "Ja, wir bieten kostenlose Onboarding-Workshops für neue Vereine an. In einer einstündigen Videokonferenz zeigen wir Ihnen alle wichtigen Funktionen und beantworten Ihre Fragen. Termine können Sie direkt nach der Registrierung buchen.",
      },
      {
        question: "Kann ich Feature-Wünsche einreichen?",
        answer:
          "Absolut! Wir entwickeln die Software kontinuierlich weiter und nehmen gerne Feedback und Feature-Wünsche entgegen. Viele aktuelle Funktionen sind direkt aus dem Feedback unserer Nutzer entstanden.",
      },
      {
        question: "Gibt es eine Dokumentation?",
        answer:
          "Ja, wir bieten eine ausführliche Online-Dokumentation mit Schritt-für-Schritt-Anleitungen und Video-Tutorials zu allen wichtigen Funktionen. Diese wird kontinuierlich erweitert.",
      },
    ],
  },
  {
    title: "Migration & Umstellung",
    icon: BookOpen,
    questions: [
      {
        question: "Kann ich parallel zu meiner alten Software testen?",
        answer:
          "Ja, Sie können schach.studio 30 Tage lang parallel zu Ihrer bestehenden Software nutzen und Ihre Daten importieren. So können Sie alle Funktionen in Ruhe testen, bevor Sie komplett umsteigen.",
      },
      {
        question: "Was muss ich bei der Migration beachten?",
        answer:
          "Wir empfehlen: 1) Mitgliederdaten in CSV/Excel vorbereiten, 2) Vereinsinformationen und Logo bereithalten, 3) Termine und Turnierdaten exportieren, 4) E-Mail-Verteiler für die Mitgliedereinladung vorbereiten. Unser Support-Team hilft Ihnen gerne bei der Planung und Durchführung.",
      },
      {
        question: "Bleiben die Passwörter meiner Mitglieder erhalten?",
        answer:
          "Nein, bei der Migration müssen alle Mitglieder ein neues Passwort vergeben. Sie erhalten automatisch eine Einladungs-E-Mail mit einem personalisierten Registrierungslink.",
      },
    ],
  },
  {
    title: "Sonstige Fragen",
    icon: LifeBuoy,
    questions: [
      {
        question: "Kann ich die Software auch für andere Sportarten nutzen?",
        answer:
          "schach.studio ist speziell auf die Bedürfnisse von Schachvereinen zugeschnitten (DWZ/Elo, Partiedatenbank, Turniermodi). Für andere Sportarten ist die Software daher nur bedingt geeignet.",
      },
      {
        question: "Was passiert, wenn der Betreiber insolvent geht?",
        answer:
          "Sie können jederzeit alle Ihre Daten vollständig exportieren (Mitglieder, Partien, Turniere, Finanzen). Es existiert ein Notfallplan, der im Insolvenzfall einen erweiterten Export-Zugang für mindestens 90 Tage garantiert.",
      },
      {
        question: "Wie kann ich mich registrieren?",
        answer:
          'Klicken Sie einfach auf "Kostenlos starten" auf unserer Website und folgen Sie dem Registrierungsprozess. Nach der Eingabe Ihrer E-Mail-Adresse und der Vereinsinformationen können Sie sofort loslegen.',
      },
    ],
  },
];

export function FAQAccordion({ sections }: { sections?: FAQSection[] }) {
  const effectiveSections = sections ?? [];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {effectiveSections.length > 0 ? (
        <div className="space-y-12">
          {effectiveSections.map((section, sIdx) => {
            const Icon = section.icon;
            return (
              <section key={sIdx}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, qIdx) => (
                    <AccordionItem key={qIdx} value={`${sIdx}-${qIdx}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {defaultFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
