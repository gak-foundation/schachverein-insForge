import { Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Kontakt",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Kontakt</h1>
        <p className="text-lg text-gray-600 mb-12">
          Sie haben Fragen oder möchten Mitglied werden? 
          Nehmen Sie gern Kontakt zu uns auf.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Schachverein</p>
                    <p className="text-gray-600">Musterstraße 123</p>
                    <p className="text-gray-600">12345 Musterstadt</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <a href="mailto:info@schachverein.de" className="text-blue-600 hover:underline">
                    info@schachverein.de
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <a href="tel:+491234567890" className="text-blue-600 hover:underline">
                    +49 123 4567890
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mitglied werden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Sie möchten Teil unseres Vereins werden? 
                  Schreiben Sie uns einfach eine E-Mail oder rufen Sie an.
                </p>
                <a href="mailto:mitgliedschaft@schachverein.de">
                  <Button className="w-full">Zum Mitgliedsantrag</Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Training Times */}
          <Card>
            <CardHeader>
              <CardTitle>Trainingszeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="font-medium">Dienstag</p>
                  <p className="text-gray-600">18:00 – 22:00 Uhr</p>
                  <p className="text-sm text-gray-500">Freies Spiel & Training</p>
                </div>

                <div className="border-b pb-4">
                  <p className="font-medium">Freitag</p>
                  <p className="text-gray-600">19:00 – 23:00 Uhr</p>
                  <p className="text-sm text-gray-500">Blitzturnier (ab 20:00 Uhr)</p>
                </div>

                <div>
                  <p className="font-medium">Sonntag</p>
                  <p className="text-gray-600">14:00 – 18:00 Uhr</p>
                  <p className="text-sm text-gray-500">Jugendtraining</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> An Feiertagen und in den Ferien 
                  können die Trainingszeiten abweichen. 
                  Aktuelle Informationen finden Sie unter Termine.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
