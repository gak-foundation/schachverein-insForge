"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface AnalysisBoardProps {
  initialPgn?: string;
}

export function AnalysisBoard({ initialPgn }: AnalysisBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState("start");
  const [evaluation, setEvaluation] = useState<string>("0.0");
  const [bestMove, setBestMove] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (initialPgn) {
      const newGame = new Chess();
      newGame.loadPgn(initialPgn);
      setGame(newGame);
      setFen(newGame.fen());
    }
  }, [initialPgn]);

  useEffect(() => {
    // Initialize Stockfish Worker
    const worker = new Worker("/stockfish-worker.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.startsWith("info depth")) {
        const scoreMatch = msg.match(/score cp (-?\d+)/);
        const mateMatch = msg.match(/score mate (-?\d+)/);
        if (scoreMatch) {
          const cp = parseInt(scoreMatch[1]);
          setEvaluation((cp / 100).toFixed(2));
        } else if (mateMatch) {
          setEvaluation(`M${mateMatch[1]}`);
        }
      } else if (msg.startsWith("bestmove")) {
        const move = msg.split(" ")[1];
        setBestMove(move);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (isAnalyzing && workerRef.current) {
      workerRef.current.postMessage(`position fen ${game.fen()}`);
      workerRef.current.postMessage("go depth 15");
    }
  }, [game, isAnalyzing]);

  function makeAMove(move: any) {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setFen(game.fen());
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    return move;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <div className="space-y-4">
        <div className="aspect-square w-full max-w-[600px] mx-auto">
          {/* @ts-ignore - position prop type mismatch in library */}
          <Chessboard position={fen} onPieceDrop={onDrop} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => {
            const history = game.history();
            if (history.length > 0) {
              game.undo();
              setGame(new Chess(game.fen()));
              setFen(game.fen());
            }
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant={isAnalyzing ? "default" : "outline"} 
            onClick={() => setIsAnalyzing(!isAnalyzing)}
          >
            {isAnalyzing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            Analyse {isAnalyzing ? "stoppen" : "starten"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => {
            const newGame = new Chess();
            setGame(newGame);
            setFen("start");
          }}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Engine Bewertung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold tracking-tighter">
                {evaluation}
              </div>
              {bestMove && (
                <Badge variant="secondary" className="font-mono">
                  Best: {bestMove}
                </Badge>
              )}
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ 
                  width: `${Math.max(5, Math.min(95, 50 + (parseFloat(evaluation) || 0) * 10))}%` 
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partieverlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {game.history().map((move, i) => (
                  <div key={i} className="flex gap-2 p-1 rounded hover:bg-accent">
                    <span className="text-muted-foreground w-6 text-right">{Math.floor(i / 2) + 1}.</span>
                    <span className="font-bold">{move}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
