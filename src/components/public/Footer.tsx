import Link from "next/link";
import { Circle, Mail, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Circle className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">Schachverein</span>
            </div>
            <p className="text-sm text-gray-400">
              Gemeinschaft, Strategie und Leidenschaft für das königliche Spiel. 
              Seit vielen Jahren treffen wir uns zum Spielen, Lernen und Wettbewerb.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/mannschaften" className="text-sm hover:text-white transition-colors">
                  Mannschaften
                </Link>
              </li>
              <li>
                <Link href="/termine" className="text-sm hover:text-white transition-colors">
                  Termine
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-sm hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm hover:text-white transition-colors">
                  Mitgliederbereich
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">Musterstraße 123<br />12345 Musterstadt</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@schachverein.de" className="text-sm hover:text-white">
                  info@schachverein.de
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a href="tel:+491234567890" className="text-sm hover:text-white">
                  +49 123 4567890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Schachverein. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-4">
            <Link href="/impressum" className="text-sm text-gray-500 hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm text-gray-500 hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
