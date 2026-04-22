import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt | schach.studio",
  description:
    "Nehmen Sie Kontakt mit uns auf. Wir helfen Ihnen gerne bei Fragen zu schach.studio.",
  alternates: {
    canonical: "/kontakt",
  },
};

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Kontaktieren Sie uns</h1>
            <p className="text-xl text-muted-foreground">
              Haben Sie Fragen? Wir sind für Sie da.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-xl bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">E-Mail</h3>
              <a
                href="mailto:kontakt@schach.studio"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                kontakt@schach.studio
              </a>
            </div>

            <div className="text-center p-6 rounded-xl bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Telefon</h3>
              <p className="text-muted-foreground">Auf Anfrage</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-card border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Anschrift</h3>
              <p className="text-muted-foreground">
                schach.studio
                <br />
                Deutschland
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-xl bg-card border">
              <ContactForm />
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-muted/30 border">
            <h3 className="font-bold mb-4">Schnelle Antworten</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Demo-Anfragen:</span>{" "}
                Innerhalb von 24 Stunden
              </p>
              <p>
                <span className="font-medium text-foreground">Technischer Support:</span>{" "}
                Innerhalb von 48 Stunden
              </p>
              <p>
                <span className="font-medium text-foreground">Allgemeine Anfragen:</span>{" "}
                Innerhalb von 2-3 Werktagen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
