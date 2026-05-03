import { createServiceClient } from "@/lib/insforge";
import { notFound } from "next/navigation";
import { ClubSettings } from "@/types";

interface ImprintPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ImprintPage({ params }: ImprintPageProps) {
  const { slug } = await params;
  const client = createServiceClient();
  const { data: rawClub, error } = await client
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching club:", error);
  }

  if (!rawClub) {
    notFound();
  }

  const club = {
    ...rawClub,
    contactEmail: rawClub.contact_email,
  };

  const settings = (club.settings as unknown as ClubSettings) || {};

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">Angaben gemäß § 5 TMG</h2>
          <p>
            {club.name}<br />
            {club.address?.street || "Musterstraße 123"}<br />
            {club.address?.zipCode || "12345"} {club.address?.city || "Musterstadt"}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Vertreten durch</h2>
          <p>
            {settings.representatives || "Max Mustermann, 1. Vorsitzender\nErika Musterfrau, 2. Vorsitzende"}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt</h2>
          <p>
            {settings.phone && <>Telefon: {settings.phone}<br /></>}
            E-Mail: {club.contactEmail || "info@schach.studio"}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Registereintrag</h2>
          <p>
            Eintragung im Vereinsregister<br />
            Registergericht: {settings.registerCourt || "Amtsgericht Musterstadt"}<br />
            Registernummer: {settings.registerNumber || "VR 12345"}
          </p>

          {settings.taxId && (
            <>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                {settings.taxId}
              </p>
            </>
          )}

          <h2 className="text-2xl font-semibold mt-8 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            {settings.responsiblePerson || (club.address ? `${club.name}\n${club.address.street}\n${club.address.zipCode} ${club.address.city}` : "Max Mustermann")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>.
          </p>
          <p>
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen 
            oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. 
            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </div>

        <p className="text-gray-500 mt-12">
          Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}
