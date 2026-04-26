"use client";

import { LichessGame } from "@/lib/lichess";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Swords } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface LichessGamesListProps {
  games: LichessGame[];
  username: string;
}

export function LichessGamesList({ games, username }: LichessGamesListProps) {
  if (games.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Letzte Lichess Partien
          </CardTitle>
          <CardDescription>Keine aktuellen Partien gefunden.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Letzte Lichess Partien
        </CardTitle>
        <CardDescription>Die letzten 10 Partien von {username} auf Lichess.org</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {games.map((game) => {
            const isWhite = game.players.white.user?.name.toLowerCase() === username.toLowerCase();
            const opponent = isWhite ? game.players.black : game.players.white;
            const myPlayer = isWhite ? game.players.white : game.players.black;
            
            let resultLabel = "Remis";
            let resultColor = "bg-slate-100 text-slate-700";
            
            if (game.winner) {
              const iWon = (game.winner === "white" && isWhite) || (game.winner === "black" && !isWhite);
              resultLabel = iWon ? "Sieg" : "Niederlage";
              resultColor = iWon 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            }

            return (
              <div key={game.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                      {game.speed}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(game.createdAt), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                  <a 
                    href={`https://lichess.org/${game.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Analyse <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-sm truncate">
                        {opponent.user?.name || "Anonym"}
                      </span>
                      <span className="text-xs text-slate-400">({opponent.rating})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {game.opening?.name || "Unbekannte Eröffnung"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-medium">{myPlayer.rating}</div>
                      <div className="text-[10px] text-slate-400">Rating</div>
                    </div>
                    <Badge className={`${resultColor} font-bold px-2.5 py-0.5 border-none`}>
                      {resultLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
