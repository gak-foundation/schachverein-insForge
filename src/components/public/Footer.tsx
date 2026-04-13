import Link from "next/link";
import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground text-primary shadow-lg">
                <span className="text-2xl font-serif">♔</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Schachverein</span>
            </div>
            <p className="text-primary-foreground/70 max-w-md leading-relaxed mb-8">
              Gemeinschaft, Strategie und Leidenschaft für das königliche Spiel. 
              Gegründet 1920, fördern wir seit über einem Jahrhundert den Schachsport in unserer Region 
              und bieten Spielern aller Altersklassen eine Heimat.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders if needed */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6">
              Navigation
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm text-primary-foreground/70 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-white transition-all group-hover:w-4" />
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/mannschaften" className="text-sm text-primary-foreground/70 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-white transition-all group-hover:w-4" />
                  Mannschaften
                </Link>
              </li>
              <li>
                <Link href="/termine" className="text-sm text-primary-foreground/70 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-white transition-all group-hover:w-4" />
                  Termine
                </Link>
              </li>
              <li>
                <Link href="/turniere" className="text-sm text-primary-foreground/70 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-white transition-all group-hover:w-4" />
                  Turniere
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-primary-foreground/70 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 bg-white transition-all group-hover:w-4" />
                  Mitgliederbereich
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6">
              Kontakt
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-foreground/50 shrink-0" />
                <span className="text-sm text-primary-foreground/70 leading-relaxed">
                  Schachheim am Markt<br />
                  Musterstraße 123<br />
                  12345 Musterstadt
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="h-5 w-5 text-primary-foreground/50 shrink-0" />
                <a href="mailto:info@schachverein.de" className="text-sm text-primary-foreground/70 group-hover:text-white transition-colors">
                  info@schachverein.de
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="h-5 w-5 text-primary-foreground/50 shrink-0" />
                <a href="tel:+491234567890" className="text-sm text-primary-foreground/70 group-hover:text-white transition-colors">
                  +49 123 4567890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-primary-foreground/40 font-medium tracking-wide">
            © {currentYear} SCHACHVEREIN MANAGEMENT. ENTWICKELT FÜR DEN MODERNEN CLUB.
          </p>
          <div className="flex gap-8">
            <Link href="/impressum" className="text-xs text-primary-foreground/40 hover:text-white transition-colors font-bold uppercase tracking-widest">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-xs text-primary-foreground/40 hover:text-white transition-colors font-bold uppercase tracking-widest">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
