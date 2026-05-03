import { Sparkles, Rocket, Building2, CalendarDays, Users, Plus, Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/lib/clubs/actions";

type OnboardingBannerProps = {
  hasEvents: boolean;
  hasMembers: boolean;
  hasLogo: boolean;
};

export function OnboardingBanner({ hasEvents, hasMembers, hasLogo }: OnboardingBannerProps) {
  const items = [
    { title: "Verein erstellt", done: true, icon: Building2 },
    { title: "Erster Termin", done: hasEvents, icon: CalendarDays, href: "/dashboard/calendar/new" },
    { title: "Mitglieder importieren", done: hasMembers, icon: Users, href: "/dashboard/members" },
    { title: "Profil vervollständigen", done: hasLogo, icon: Plus, href: "/dashboard/profile" },
  ];
  const progress = items.filter((i) => i.done).length / items.length;

  return (
    <Card className="border-blue-200 bg-blue-50/30 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="h-24 w-24 text-blue-600" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Rocket className="h-5 w-5 text-blue-600" />
          Onboarding-Checkliste
        </CardTitle>
        <CardDescription className="text-blue-700/70">
          Nur noch wenige Schritte, bis dein Verein vollständig einsatzbereit ist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all",
                item.done
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                  : "bg-white border-blue-100 text-blue-900 hover:border-blue-300"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  item.done ? "bg-emerald-500 text-white" : "bg-blue-100 text-blue-600"
                )}
              >
                {item.done ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.title}</p>
                {!item.done && item.href && (
                  <Link href={item.href} className="text-xs font-medium text-blue-600 hover:underline">
                    Jetzt erledigen →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-white/50 rounded-xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-blue-900">Gesamtfortschritt</div>
            <div className="h-2 w-32 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <form action={completeOnboardingAction}>
            <Button type="submit" variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
              Checkliste ausblenden
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
