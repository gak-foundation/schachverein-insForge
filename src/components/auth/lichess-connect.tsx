"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Link from "next/link";

interface LichessConnectProps {
  username?: string | null;
  isVerified?: boolean;
}

export function LichessConnect({ username, isVerified }: LichessConnectProps) {
  return (
    <Card className={isVerified ? "border-green-100 bg-green-50/20" : ""}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[#252321] flex items-center justify-center">
             <span className="text-white font-bold text-lg leading-none">L</span>
          </div>
          <CardTitle>Lichess Verknüpfung</CardTitle>
        </div>
        <CardDescription>
          Verknüpfen Sie Ihr Lichess-Konto, um an Online-Turnieren teilzunehmen und Ihre Ratings zu synchronisieren.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVerified ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-bold text-green-900">{username}</p>
                <p className="text-xs text-green-700">Konto erfolgreich verifiziert</p>
              </div>
            </div>
            <Link href="https://lichess.org/@/${username}" target="_blank">
              <Button variant="ghost" size="sm" className="gap-2">
                Profil ansehen <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {username && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-sm border border-amber-100">
                <AlertCircle className="h-4 w-4" />
                <span>Benutzername hinterlegt ({username}), aber noch nicht verifiziert.</span>
              </div>
            )}
            <Link href="/api/auth/lichess/connect">
              <Button className="w-full bg-[#252321] hover:bg-[#3d3935] text-white font-bold gap-2">
                Mit Lichess anmelden
              </Button>
            </Link>
            <p className="text-[10px] text-muted-foreground text-center italic">
              Wir erhalten nur Lesezugriff auf Ihre öffentlichen Profildaten und Einstellungen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
