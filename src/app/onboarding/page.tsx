"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  Calendar, 
  Check, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClubAction, completeOnboardingAction } from "@/lib/clubs/actions";
import { createEvent } from "@/features/calendar/actions";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

type Step = "welcome" | "club" | "members" | "event" | "finished";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Form States
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");

  useEffect(() => {
    const steps: Step[] = ["welcome", "club", "members", "event", "finished"];
    const index = steps.indexOf(step);
    setProgress((index / (steps.length - 1)) * 100);
  }, [step]);

  // Step 1: Create Club
  async function handleCreateClub(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createClubAction(formData);
      if (result.success && result.club) {
        setClubId(result.club.id);
        setClubName(result.club.name);
        setStep("members");
        toast({ title: "Verein erstellt!", description: `${result.club.name} wurde erfolgreich angelegt.` });
      }
    } catch (error) {
      toast({ 
        title: "Fehler", 
        description: error instanceof Error ? error.message : "Verein konnte nicht erstellt werden",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Step 2: Member Info (Placeholder for now, just skip or add one)
  async function handleNextFromMembers() {
    setStep("event");
  }

  // Step 3: Create First Event
  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await createEvent(formData, clubId || undefined);
      setStep("finished");
      toast({ title: "Termin erstellt!", description: "Der erste Vereinsabend ist geplant." });
    } catch (error) {
      toast({ 
        title: "Fehler", 
        description: error instanceof Error ? error.message : "Termin konnte nicht erstellt werden",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFinish() {
    setIsLoading(true);
    try {
      await completeOnboardingAction();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({ title: "Fehler", description: "Onboarding konnte nicht abgeschlossen werden." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">S</div>
            <span className="font-bold text-xl tracking-tight">Schach.studio</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Schritt {step === "welcome" ? 1 : step === "club" ? 2 : step === "members" ? 3 : step === "event" ? 4 : 5} von 5
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-12" />

        {step === "welcome" && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Willkommen an Bord!</h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                Wir freuen uns, dass du deinen Schachverein mit Schach.studio digitalisieren möchtest.
                In wenigen Minuten sind wir startklar.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                { icon: Building2, title: "Verein anlegen", desc: "Basisdaten und Logo" },
                { icon: Users, title: "Mitglieder", desc: "Importieren oder anlegen" },
                { icon: Calendar, title: "Termine", desc: "Erste Events planen" },
              ].map((item, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <item.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={() => setStep("club")} size="lg" className="h-14 px-8 text-lg font-bold gap-2">
              Jetzt starten <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {step === "club" && (
          <Card className="border-primary/20 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleCreateClub}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Dein Verein
                </CardTitle>
                <CardDescription>
                  Geben Sie die Basisdaten Ihres Schachvereins ein.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vereinsname</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="z.B. SK Königsjäger e.V." 
                    required 
                    value={clubName} 
                    onChange={(e) => setClubName(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Kontakt E-Mail (öffentlich)</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" placeholder="vorstand@meinverein.de" className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt</Label>
                    <Input id="city" name="city" placeholder="Berlin" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">PLZ</Label>
                    <Input id="zipCode" name="zipCode" placeholder="10115" className="h-11" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-4 pt-6">
                <Button type="button" variant="ghost" onClick={() => setStep("welcome")}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
                </Button>
                <Button type="submit" size="lg" disabled={isLoading} className="font-bold">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verein erstellen
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === "members" && (
          <Card className="border-primary/20 shadow-xl animate-in slide-in-from-right-4 duration-500">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Mitglieder hinzufügen
              </CardTitle>
              <CardDescription>
                Du kannst Mitglieder später bequem per Excel oder über den DSB-Import hinzufügen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-dashed flex items-center gap-4 text-left">
                  <div className="h-10 w-10 bg-blue-500/10 rounded flex items-center justify-center text-blue-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">DSB-Import verfügbar</p>
                    <p className="text-xs text-muted-foreground">Importiere deine Mitglieder direkt über die ZPS-Nummer.</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Für den Moment überspringen wir diesen Schritt, damit du dir erst einmal das Dashboard ansehen kannst.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4 pt-6">
              <Button type="button" variant="ghost" onClick={() => setStep("club")} disabled>
                <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={handleNextFromMembers} size="lg" className="font-bold">
                Weiter zum nächsten Schritt
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "event" && (
          <Card className="border-primary/20 shadow-xl animate-in slide-in-from-right-4 duration-500">
            <form onSubmit={handleCreateEvent}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Der erste Vereinsabend
                </CardTitle>
                <CardDescription>
                  Planen Sie direkt Ihren nächsten Termin, um Ihre Mitglieder zu informieren.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel des Termins</Label>
                  <Input id="title" name="title" defaultValue="Erster Vereinsabend & Kennenlernen" required className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Datum & Uhrzeit</Label>
                    <Input id="startDate" name="startDate" type="datetime-local" required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Typ</Label>
                    <select id="eventType" name="eventType" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="training">Training</option>
                      <option value="tournament">Turnier</option>
                      <option value="match">Mannschaftskampf</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-6">
                <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Termin speichern & weiter
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("finished")} className="w-full text-muted-foreground">
                  Diesen Schritt überspringen
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === "finished" && (
          <Card className="border-primary/20 shadow-2xl animate-in zoom-in duration-500 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-primary" />
            <CardContent className="space-y-8 text-center py-16">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Sparkles className="h-12 w-12 text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold tracking-tight">Alles bereit!</h2>
                <p className="text-xl text-muted-foreground max-w-sm mx-auto">
                  Ihr Verein <span className="text-foreground font-bold">"{clubName}"</span> wurde eingerichtet und ist startklar.
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={handleFinish} size="lg" className="w-full h-14 text-xl font-bold px-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Zum Dashboard"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Schach.studio &mdash; Die moderne Plattform für Schachvereine
        </p>
      </div>
    </div>
  );
}
