import { DemoManager } from "@/components/marketing/demo-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo | schach.studio",
  description: "Testen Sie schach.studio interaktiv ohne Registrierung. Entdecken Sie die Funktionen fuer Schachvereine.",
};

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Entdecken Sie schach.studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Interaktive Demo mit fiktiven Daten. Keine Registrierung erforderlich.
          </p>
        </div>

        <DemoManager />
      </div>
    </div>
  );
}
