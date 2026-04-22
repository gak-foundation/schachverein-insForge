import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AnalysisBoard } from "@/components/training/analysis-board";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Analysebrett",
};

export default async function AnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interaktive Analyse</h1>
          <p className="text-sm text-gray-500">Nutzen Sie das Analysebrett mit integrierter Stockfish-Engine.</p>
        </div>
        <a
          href="https://lichess.org/analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium h-8 px-2.5 hover:bg-muted transition-colors"
        >
          Zu Lichess.org →
        </a>
      </div>

      <AnalysisBoard />
    </div>
  );
}
