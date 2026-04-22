import {
  Users,
  Trophy,
  Mail,
  Smartphone,
  Shield,
  PieChart,
  Globe,
  FileText,
  Lock,
  ClipboardCheck,
  CalendarCheck,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Mitgliederverwaltung",
    description:
      "Mitglieder pflegen ihre Daten selbst. Inklusive DWZ-Integration, Familien-Verknüpfungen und automatischer Beitragsstufen.",
  },
  {
    icon: CalendarCheck,
    title: "Mannschafts-Planer",
    description:
      "Strukturierte Verfügbarkeitsabfragen und Aufstellungsplanung per Drag & Drop für Mannschaftsführer.",
  },
  {
    icon: Trophy,
    title: "Turniere & Live-Ticker",
    description:
      "Schweizer System und Rundenturniere. Ergebnisse werden in Echtzeit auf der Vereins-Webseite veröffentlicht.",
  },
  {
    icon: PieChart,
    title: "Finanzen & SEPA",
    description:
      "Automatische Beitragsberechnung und SEPA-XML Export (pain.008). 3-stufiges Mahnwesen inklusive.",
  },
  {
    icon: ClipboardCheck,
    title: "Protokoll-Generator",
    description:
      "Revisionssichere Protokollierung von Mitgliederversammlungen und Vorstandssitzungen direkt im System.",
  },
  {
    icon: Mail,
    title: "E-Mail-Verteiler",
    description:
      "DSGVO-konforme Kommunikation mit Zielgruppen-Filtern. Opt-in/Opt-out Management für Newsletter.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First PWA",
    description:
      "Mitglieder nutzen alle Funktionen bequem am Smartphone — keine Installation im App-Store nötig.",
  },
  {
    icon: Globe,
    title: "Vereins-Website",
    description:
      "Vollautomatische Webseite mit Terminkalender, News und Mannschaftsseiten. SEO-optimiert.",
  },
  {
    icon: Shield,
    title: "Datenschutz (DSGVO)",
    description:
      "Vollständiges Einwilligungsmanagement für Bilder und Daten. Hosting ausschließlich in Deutschland.",
  },
  {
    icon: Lock,
    title: "Sicherheit & Audit",
    description:
      "AES-256 Verschlüsselung für IBANs, Rollen-basierte Rechte und lückenloses Audit-Logging.",
  },
  {
    icon: FileText,
    title: "DSB/DeWIS-Sync",
    description:
      "Automatischer Abgleich mit der DeWIS-Datenbank und Exporte für offizielle Verbandsmeldungen.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group p-6 rounded-xl bg-card border hover:border-primary/50 transition-all duration-200 hover:shadow-md"
        >
          <div className="mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          </div>
          <h3 className="font-bold mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
