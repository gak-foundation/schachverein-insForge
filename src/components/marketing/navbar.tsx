"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { APP_URL } from "@/lib/urls";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Pilot-Programm", href: "/bewerbung?type=pilot", highlighted: true },
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
          <Link href="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
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
                className={cn(
                  "text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-0.5",
                  item.highlighted
                    ? "text-primary font-bold hover:text-primary/80"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.label}
                {item.highlighted && (
                  <span className="absolute -top-1 -right-4 flex h-2 w-2" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isPending && (
              <>
                {session ? (
                  <a
                    href={`${APP_URL}/dashboard`}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Zum Dashboard
                  </a>
                ) : (
                  <>
                    <a
                      href={`${APP_URL}/auth/login`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Login
                    </a>
                    <a
                      href={`${APP_URL}/auth/signup`}
                      className={cn(buttonVariants({ size: "sm" }), "gap-2")}
                    >
                      Jetzt starten
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            type="button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-nav"
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out motion-reduce:transition-none",
            mobileMenuOpen ? "max-h-[500px] opacity-100 py-4 border-t" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-base font-medium rounded-md transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  item.highlighted
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
                {item.highlighted && (
                  <span className="flex h-2 w-2 relative" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75 motion-reduce:animate-none"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Link>
            ))}
            <div className="px-4 pt-4 border-t mt-2 flex flex-col gap-2">
              {session ? (
                <a
                  href={`${APP_URL}/dashboard`}
                  className={cn(buttonVariants({ variant: "default" }), "w-full gap-2 justify-center")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Zum Dashboard
                </a>
              ) : (
                <>
                  <a
                    href={`${APP_URL}/auth/login`}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
                  >
                    Login
                  </a>
                  <a
                    href={`${APP_URL}/auth/signup`}
                    className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
                  >
                    Jetzt starten
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
