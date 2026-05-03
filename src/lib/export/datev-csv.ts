export interface DatevLine {
  umsatz: string;
  sollkonto: string;
  habenkonto: string;
  betrag: string;
  buchungstext: string;
  belegdatum: string;
  gegenkonto?: string;
  kost1?: string;
  kost2?: string;
}

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADERS = [
  "Umsatz", "Sollkonto", "Habenkonto", "Betrag", "Buchungstext",
  "Belegdatum", "Gegenkonto", "KOST1", "KOST2"
];

export function generateDatevCSV(lines: DatevLine[]): string {
  const rows = lines.map((l) =>
    [
      csvEscape(l.umsatz),
      csvEscape(l.sollkonto),
      csvEscape(l.habenkonto),
      csvEscape(l.betrag),
      csvEscape(l.buchungstext),
      csvEscape(l.belegdatum),
      csvEscape(l.gegenkonto || ""),
      csvEscape(l.kost1 || ""),
      csvEscape(l.kost2 || ""),
    ].join(";")
  );

  return [HEADERS.join(";"), ...rows].join("\r\n");
}
