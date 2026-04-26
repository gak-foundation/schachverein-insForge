"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
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

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
