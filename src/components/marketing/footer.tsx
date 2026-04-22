import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-slate-50/50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <span className="text-sm font-serif">♔</span>
              </div>
              <span className="text-lg font-bold tracking-tight">schach.studio</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Die moderne Plattform für die Verwaltung und Organisation von Schachvereinen in Deutschland.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Produkt</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/preise" className="hover:text-primary transition-colors">Preise</Link></li>
              <li><Link href="/demo" className="hover:text-primary transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/impressum" className="hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link href="/barrierefreiheit" className="hover:text-primary transition-colors">Barrierefreiheit</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/kontakt" className="hover:text-primary transition-colors">Kontakt</Link></li>
              <li><Link href="/hilfe" className="hover:text-primary transition-colors">Hilfebereich</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} schach.studio. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
