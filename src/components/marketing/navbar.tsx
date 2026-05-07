"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ArrowRight, ChevronDown, Newspaper, HelpCircle, Mail, Sparkles, Home, Shield, Users, Trophy, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

const mainNavItems = [
  { label: "Startseite", href: "/", icon: Home },
  { label: "Blog", href: "/blog", icon: Newspaper },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Kontakt", href: "/kontakt", icon: Mail },
];

const featureItems = [
  { label: "Mitgliederverwaltung", href: "/#features", icon: Users, desc: "Mitglieder, Beiträge & mehr" },
  { label: "Turniere", href: "/#features", icon: Trophy, desc: "Organisation & Auswertung" },
  { label: "Barrierefreiheit", href: "/barrierefreiheit", icon: Shield, desc: "WCAG 2.2 AA & BFSG 2025" },
  { label: "Kostenlos", href: "/#features", icon: Wallet, desc: "Dauerhaft kostenfrei" },
];

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
            <img
              src="/logo-64.png"
              alt="schach.studio Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg shadow-sm transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold tracking-tight">schach.studio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </span>
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}

            {/* Features Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  featuresOpen || pathname === "/#features" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-expanded={featuresOpen}
                onClick={() => setFeaturesOpen(!featuresOpen)}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Features
                <ChevronDown className={cn("h-3 w-3 transition-transform", featuresOpen && "rotate-180")} />
              </button>

              {featuresOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-xl bg-card border shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {featureItems.map((feature) => (
                    <Link
                      key={feature.label}
                      href={feature.href}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setFeaturesOpen(false)}
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isPending && (
              <>
                {session ? (
                  <Link
                    href="/dashboard"
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Zum Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className={cn(buttonVariants({ size: "sm" }), "gap-2")}
                    >
                      Jetzt starten
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
            mobileMenuOpen ? "max-h-[600px] opacity-100 py-4 border-t" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2.5 text-base font-medium rounded-lg transition-colors flex items-center gap-3",
                  isActive(item.href)
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">
              Features
            </div>
            {featureItems.map((feature) => (
              <Link
                key={feature.label}
                href={feature.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <feature.icon className="h-4 w-4" />
                {feature.label}
              </Link>
            ))}

            <div className="px-4 pt-4 border-t mt-4 flex flex-col gap-2">
              {session ? (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "default" }), "w-full gap-2 justify-center")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Zum Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={cn(buttonVariants({ variant: "default" }), "w-full justify-center gap-2")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Jetzt starten
                    <ArrowRight className="h-4 w-4" />
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
