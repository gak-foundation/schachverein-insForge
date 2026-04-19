import { Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { clubs } from "@/lib/db/schema";
import { notFound } from "next/navigation";

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.slug, slug),
  });

  if (!club) {
    notFound();
  }

  const settings = club.settings as any || {};
  const trainingTimes = settings.trainingTimes || [
    { day: "Dienstag", time: "18:00 – 22:00 Uhr", label: "Freies Spiel & Training" },
    { day: "Freitag", time: "19:00 – 23:00 Uhr", label: "Blitzturnier (ab 20:00 Uhr)" },
    { day: "Sonntag", time: "14:00 – 18:00 Uhr", label: "Jugendtraining" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Kontakt</h1>
        <p className="text-lg text-gray-600 mb-12">
          Sie haben Fragen oder möchten Mitglied werden? 
          Nehmen Sie gern Kontakt zum {club.name} auf.
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
                    <p className="font-medium">{club.name}</p>
                    {club.address ? (
                      <>
                        <p className="text-gray-600">{club.address.street}</p>
                        <p className="text-gray-600">{club.address.zipCode} {club.address.city}</p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Keine Adresse hinterlegt</p>
                    )}
                  </div>
                </div>

                {club.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <a href={`mailto:${club.contactEmail}`} className="text-blue-600 hover:underline">
                      {club.contactEmail}
                    </a>
                  </div>
                )}

                {settings.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
                      {settings.phone}
                    </a>
                  </div>
                )}
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
                <Button className="w-full" asChild>
                  <a href={`mailto:${club.contactEmail || 'info@schach.studio'}?subject=Mitgliedsantrag`}>
                    Zum Mitgliedsantrag
                  </a>
                </Button>
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
                {trainingTimes.map((item: any, idx: number) => (
                  <div key={idx} className={idx < trainingTimes.length - 1 ? "border-b pb-4" : ""}>
                    <p className="font-medium">{item.day}</p>
                    <p className="text-gray-600">{item.time}</p>
                    {item.label && <p className="text-sm text-gray-500">{item.label}</p>}
                  </div>
                ))}
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
