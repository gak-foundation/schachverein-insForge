"use client";

import { useState, useRef } from "react";
import { importTRF } from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileJson, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface TRFImportDialogProps {
  tournamentId: string;
}

export function TRFImportDialog({ tournamentId }: TRFImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: { players: number; games: number };
    errors: string[];
    preview?: { players: string[]; games: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!fileContent) return;

    setIsLoading(true);
    try {
      const importResult = await importTRF(tournamentId, fileContent);
      setResult(importResult);

      if (importResult.success) {
        // Close dialog after short delay on success
        setTimeout(() => {
          setOpen(false);
          setFileContent(null);
          setFileName("");
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        imported: { players: 0, games: 0 },
        errors: [error instanceof Error ? error.message : "Unbekannter Fehler"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".trf")) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        setResult(null);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            TRF Import
          </Button>
        }
      />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            TRF-Datei importieren
          </DialogTitle>
          <DialogDescription>
            Importiere Turnierdaten im SwissChess TRF-Format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!fileContent ? (
            <button
              type="button"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
            >
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                TRF-Datei hierher ziehen oder klicken zum Auswählen
              </p>
              <p className="text-xs text-gray-400">
                Unterstützt: .trf Dateien aus SwissChess
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".trf"
                onChange={handleFileSelect}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
            </button>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{fileName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileContent(null);
                    setFileName("");
                    setResult(null);
                  }}
                >
                  Entfernen
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Import erfolgreich! {result.imported.players} Spieler und{" "}
                    {result.imported.games} Partien importiert.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      Import fehlgeschlagen. Bitte überprüfe die Fehler unten.
                    </AlertDescription>
                  </Alert>
                  {result.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
                      <p className="font-medium text-red-700 mb-2">Fehler:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-600">
                        {result.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.preview && (
                    <div className="bg-gray-50 border rounded-md p-3 text-sm">
                      <p className="font-medium mb-2">Vorschau:</p>
                      <p className="text-gray-600">
                        {result.preview.players.length} Spieler,{" "}
                        {result.preview.games} Partien in Datei gefunden
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleImport}
            disabled={!fileContent || isLoading || result?.success}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
