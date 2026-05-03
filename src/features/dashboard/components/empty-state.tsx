import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, CalendarDays, Plus } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  memberCount: number;
};

export function EmptyState({ memberCount }: EmptyStateProps) {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-inner">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Erste Schritte
        </CardTitle>
        <CardDescription>
          Vervollständige dein Vereinsprofil, um alle Funktionen nutzen zu können.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {memberCount === 0 && (
          <Link href="/dashboard/members/new">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Users className="h-4 w-4" /> Mitglieder anlegen
            </Button>
          </Link>
        )}
        <Link href="/dashboard/calendar/new">
          <Button variant="outline" className="w-full justify-start gap-3 h-12">
            <CalendarDays className="h-4 w-4" /> Termine planen
          </Button>
        </Link>
        <Link href="/dashboard/profile">
          <Button variant="outline" className="w-full justify-start gap-3 h-12">
            <Plus className="h-4 w-4" /> Profil vervollständigen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
