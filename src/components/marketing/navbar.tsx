"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Preise", href: "/#pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/kontakt" },
];

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <span className="text-xl font-serif">♔</span>
            </div>
            <span className="text-xl font-bold tracking-tight">schach.studio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isPending && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="default" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Zum Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="gap-2">
                        Jetzt starten
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[400px] opacity-100 py-4 border-t" : "max-h-0 opacity-0"
        )}>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-4 border-t mt-2 flex flex-col gap-2">
              {session ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Zum Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Jetzt starten</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
