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
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Users,
    title: "Mitgliederverwaltung",
    description:
      "Mitglieder pflegen ihre Daten selbst. Inklusive DWZ-Integration, Familien-Verknüpfungen und automatischer Beitragsstufen.",
    isImplemented: true,
  },
  {
    icon: CalendarCheck,
    title: "Mannschafts-Planer",
    description:
      "Strukturierte Verfügbarkeitsabfragen und Aufstellungsplanung per Drag & Drop für Mannschaftsführer.",
    isImplemented: true,
  },
  {
    icon: Trophy,
    title: "Turniere & Live-Ticker",
    description:
      "Schweizer System und Rundenturniere. Ergebnisse werden in Echtzeit auf der Vereins-Webseite veröffentlicht.",
    isImplemented: true,
  },
  {
    icon: PieChart,
    title: "Finanzen & SEPA",
    description:
      "Automatische Beitragsberechnung und SEPA-XML Export (pain.008). 3-stufiges Mahnwesen inklusive.",
    isImplemented: true,
  },
  {
    icon: ClipboardCheck,
    title: "Protokoll-Generator",
    description:
      "Revisionssichere Protokollierung von Mitgliederversammlungen und Vorstandssitzungen direkt im System.",
    isImplemented: false,
  },
  {
    icon: Mail,
    title: "E-Mail-Verteiler",
    description:
      "DSGVO-konforme Kommunikation mit Zielgruppen-Filtern. Opt-in/Opt-out Management für Newsletter.",
    isImplemented: false,
  },
  {
    icon: Smartphone,
    title: "Mobile-First PWA",
    description:
      "Mitglieder nutzen alle Funktionen bequem am Smartphone — keine Installation im App-Store nötig.",
    isImplemented: true,
  },
  {
    icon: Globe,
    title: "Vereins-Website",
    description:
      "Vollautomatische Webseite mit Terminkalender, News und Mannschaftsseiten. SEO-optimiert.",
    isImplemented: true,
  },
  {
    icon: Shield,
    title: "Datenschutz (DSGVO)",
    description:
      "Vollständiges Einwilligungsmanagement für Bilder und Daten. Hosting ausschließlich in Deutschland.",
    isImplemented: true,
  },
  {
    icon: Lock,
    title: "Sicherheit & Audit",
    description:
      "AES-256 Verschlüsselung für IBANs, Rollen-basierte Rechte und lückenloses Audit-Logging.",
    isImplemented: true,
  },
  {
    icon: FileText,
    title: "DSB/DeWIS-Sync",
    description:
      "Automatischer Abgleich mit der DeWIS-Datenbank und Exporte für offizielle Verbandsmeldungen.",
    isImplemented: true,
  },
];

export function FeatureGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group p-6 rounded-xl bg-card border hover:border-primary/50 transition-all duration-200 hover:shadow-md flex flex-col"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            {feature.isImplemented ? (
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center" title="Bereits implementiert">
                <Check className="h-3.5 w-3.5 text-green-600" />
              </div>
            ) : (
              <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider py-0 px-2 h-5 bg-muted text-muted-foreground border-none">
                Coming Soon
              </Badge>
            )}
          </div>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
