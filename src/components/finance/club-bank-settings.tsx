"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClubBankSettings } from "@/lib/actions/finance";

type ClubBankRow = {
  creditorId: string | null;
  sepaIban: string | null;
  sepaBic: string | null;
};

interface ClubBankSettingsProps {
  settings: ClubBankRow | undefined;
}

export function ClubBankSettings({ settings }: ClubBankSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank- und SEPA-Creditor-Daten</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateClubBankSettings} className="grid max-w-xl gap-4">
          <div className="space-y-2">
            <Label htmlFor="creditorId">SEPA Creditor Identifier (Glaeubiger-ID)</Label>
            <Input
              id="creditorId"
              name="creditorId"
              defaultValue={settings?.creditorId ?? ""}
              placeholder="DE98ZZZ09999999999"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sepaIban">Vereins-IBAN (Einzugskonto)</Label>
            <Input
              id="sepaIban"
              name="sepaIban"
              defaultValue={settings?.sepaIban ?? ""}
              placeholder="DE89 …"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sepaBic">BIC (optional)</Label>
            <Input
              id="sepaBic"
              name="sepaBic"
              defaultValue={settings?.sepaBic ?? ""}
              placeholder="COBADEFFXXX"
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-fit">
            Speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
