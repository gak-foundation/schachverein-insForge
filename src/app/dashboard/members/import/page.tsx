"use client";

import { useState, useRef } from "react";
import { importMembersCSV, exportMembersToCSVAction } from "@/lib/actions/import-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileText, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ImportResult {
  success: boolean;
  imported: number;
  errors: { row: number; message: string }[];
}

export default function MemberImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImport(formData: FormData) {
    setIsImporting(true);
    setResult(null);

    try {
      const result = await importMembersCSV(formData);
      setResult(result);
      if (result.success) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: [{ row: 0, message: "Ein unerwarteter Fehler ist aufgetreten" }],
      });
    } finally {
      setIsImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
  }

  async function downloadTemplate() {
    const template = [
      "Vorname;Nachname;E-Mail;Telefon;Geburtsdatum;Geschlecht;DWZ;Elo;DWZ-ID;Lichess-Benutzername;Chess.com-Benutzername;Rolle;Status;Foto-Einwilligung;Newsletter-Einwilligung;Notizen",
      "Max;Mustermann;max@beispiel.de;+49123456789;1990-05-15;maennlich;1850;1900;12345678;maxspieler;maxchess;mitglied;active;ja;ja;Kommentar",
      "Erika;Musterfrau;erika@beispiel.de;+49987654321;1985-08-20;weiblich;2100;2150;87654321;erikachess;;vorstand;active;ja;nein;2. Vorsitzende",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mitglieder-import-vorlage.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function exportMembers() {
    try {
      const csv = await exportMembersToCSVAction();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mitglieder-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export fehlgeschlagen");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/members">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Mitglieder Import/Export</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Mitglieder importieren
            </CardTitle>
            <CardDescription>
              Lade eine CSV-Datei mit Mitgliederdaten hoch. Existierende E-Mail-Adressen werden übersprungen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={handleImport} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="csvFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "CSV-Datei auswählen oder hierhin ziehen"}
                  </span>
                  <span className="text-xs text-gray-400">Format: Vorname;Nachname;E-Mail;... (semicolon-getrennt)</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={!selectedFile || isImporting}
                className="w-full"
              >
                {isImporting ? "Wird importiert..." : "Importieren"}
              </Button>
            </form>

            {result && (
              <div className="space-y-2">
                {result.success && result.imported > 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {result.imported} Mitglied{result.imported === 1 ? "" : "er"} erfolgreich importiert
                    </AlertDescription>
                  </Alert>
                )}

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.errors.length} Fehler beim Import
                      </AlertDescription>
                    </Alert>

                    {result.errors.length <= 10 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Zeile</TableHead>
                            <TableHead>Fehler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.errors.map((error, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono text-sm">{error.row}</TableCell>
                              <TableCell className="text-sm text-red-600">{error.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Mitglieder exportieren
              </CardTitle>
              <CardDescription>
                Exportiere alle Mitglieder als CSV-Datei.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportMembers} variant="outline" className="w-full">
                CSV herunterladen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Import-Vorlage
              </CardTitle>
              <CardDescription>
                Lade eine Vorlage herunter, um das korrekte Format sicherzustellen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                Vorlage herunterladen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hinweise zum Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>Pflichtfelder: Vorname, Nachname, E-Mail</li>
                <li>Trennzeichen: Semikolon (;)</li>
                <li>Kodierung: UTF-8 empfohlen</li>
                <li>Datum: YYYY-MM-DD oder DD.MM.YYYY</li>
                <li>Rolle: admin, vorstand, sportwart, jugendwart, kassenwart, trainer, mitglied, eltern</li>
                <li>Status: active, inactive, resigned, honorary</li>
                <li>Boolesche Werte: ja/nein, yes/no, true/false</li>
                <li>Existierende E-Mails werden übersprungen (kein Update)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
