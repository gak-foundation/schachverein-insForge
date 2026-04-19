"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
export function TournamentCardBlock({ data }: { data: any, blockId: string, mode: string }) {
  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <div className="h-32 bg-primary flex items-center justify-center">
        <Trophy className="h-12 w-12 text-primary-foreground opacity-50" />
      </div>
      <CardHeader>
        <CardTitle>Turnier-Titel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Datum folgt</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>0 / 24 Teilnehmer</span>
          </div>
        </div>
        <Button className="w-full">Jetzt anmelden</Button>
      </CardContent>
    </Card>
  );
}
