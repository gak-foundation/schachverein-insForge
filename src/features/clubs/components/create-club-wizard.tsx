"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Calendar, 
  ArrowRight, 
  Check, 
  Loader2,
  ChevronRight,
  Sparkles
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
import { createClubAction } from "@/lib/clubs/actions";
import { createEvent } from "@/features/calendar/actions";
import { toast } from "@/components/ui/use-toast";

type Step = "club" | "event" | "finished";

export function CreateClubWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("club");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  
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
        setStep("event");
        router.refresh();
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

  // Step 2: Create First Event
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

  return (
    <div className="w-full max-w-xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Willkommen bei Schachverein</h1>
        <p className="text-muted-foreground">Lass uns in wenigen Schritten deinen Verein einrichten.</p>
      </div>

      {step === "club" && (
        <Card className="border-primary/20 shadow-lg">
          <form onSubmit={handleCreateClub}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Verein gründen
              </CardTitle>
              <CardDescription>
                Geben Sie die Basisdaten Ihres Schachvereins ein.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vereinsname</Label>
                <Input id="name" name="name" placeholder="z.B. SK Königsjäger e.V." required value={clubName} onChange={(e) => setClubName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                <Input id="contactEmail" name="contactEmail" type="email" placeholder="vorstand@meinverein.de" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input id="city" name="city" placeholder="Berlin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input id="zipCode" name="zipCode" placeholder="10115" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verein erstellen
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === "event" && (
        <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-right-4">
          <form onSubmit={handleCreateEvent}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Der erste Vereinsabend
              </CardTitle>
              <CardDescription>
                Planen Sie direkt Ihren nächsten Termin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel des Termins</Label>
                <Input id="title" name="title" defaultValue="Erster Vereinsabend & Kennenlernen" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Datum & Uhrzeit</Label>
                  <Input id="startDate" name="startDate" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Typ</Label>
                  <select id="eventType" name="eventType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="training">Training</option>
                    <option value="tournament">Turnier</option>
                    <option value="match">Mannschaftskampf</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Termin speichern & weiter
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("finished")} className="w-full text-muted-foreground">Überspringen</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {step === "finished" && (
        <Card className="border-primary/20 shadow-lg animate-in zoom-in duration-300">
          <CardContent className="space-y-6 text-center py-12">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles className="h-10 w-10 text-primary" /></div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Alles bereit!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Ihr Verein &quot;{clubName}&quot; wurde eingerichtet und ist startklar.
              </p>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full h-12 text-lg px-8 mt-6">Dashboard laden</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
