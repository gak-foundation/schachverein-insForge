import { describe, it, expect } from "vitest";
import { generateDatevCSV, type DatevLine } from "./datev-csv";

describe("generateDatevCSV", () => {
  it("sollte die korrekte DATEV-Header-Zeile erzeugen", () => {
    const result = generateDatevCSV([]);
    const lines = result.split("\r\n");
    expect(lines[0]).toBe(
      "Umsatz;Sollkonto;Habenkonto;Betrag;Buchungstext;Belegdatum;Gegenkonto;KOST1;KOST2"
    );
  });

  it("sollte Windows-Zeilenumbrüche verwenden", () => {
    const result = generateDatevCSV([
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Mitgliedsbeitrag",
        belegdatum: "01.01.2024",
      },
    ]);
    expect(result).toContain("\r\n");
    expect(result).not.toContain("\n\r");
    expect(result.split("\r\n").length).toBe(2); // Header + 1 Zeile
  });

  it("sollte Felder mit Semikolon korrekt escapen", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Beitrag; Q1",
        belegdatum: "01.01.2024",
      },
    ];
    const result = generateDatevCSV(lines);
    expect(result).toContain('"Beitrag; Q1"');
  });

  it("sollte doppelte Anführungszeichen korrekt escapen", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: 'Mitgliedsbeitrag "Premium"',
        belegdatum: "01.01.2024",
      },
    ];
    const result = generateDatevCSV(lines);
    expect(result).toContain('"Mitgliedsbeitrag ""Premium"""');
  });

  it("sollte Zeilenumbrüche in Feldern korrekt escapen", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Zeile1\nZeile2",
        belegdatum: "01.01.2024",
      },
    ];
    const result = generateDatevCSV(lines);
    expect(result).toContain('"Zeile1\nZeile2"');
    // Gesamt sollte nur 2 Zeilen (Header + 1 Datensatz) nach \r\n sein
    expect(result.split("\r\n").length).toBe(2);
  });

  it("sollte optionale Felder als leeren String ausgeben", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Mitgliedsbeitrag",
        belegdatum: "01.01.2024",
      },
    ];
    const result = generateDatevCSV(lines);
    const dataLine = result.split("\r\n")[1];
    expect(dataLine).toBe(
      "100,00;1200;8400;100,00;Mitgliedsbeitrag;01.01.2024;;;"
    );
  });

  it("sollte optionale Felder korrekt ausgeben wenn vorhanden", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Mitgliedsbeitrag",
        belegdatum: "01.01.2024",
        gegenkonto: "10001",
        kost1: "A1",
        kost2: "B2",
      },
    ];
    const result = generateDatevCSV(lines);
    const dataLine = result.split("\r\n")[1];
    expect(dataLine).toBe(
      "100,00;1200;8400;100,00;Mitgliedsbeitrag;01.01.2024;10001;A1;B2"
    );
  });

  it("sollte mehrere Zeilen korrekt generieren", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "100,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "100,00",
        buchungstext: "Beitrag 1",
        belegdatum: "01.01.2024",
      },
      {
        umsatz: "200,00",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "200,00",
        buchungstext: "Beitrag 2",
        belegdatum: "02.01.2024",
      },
    ];
    const result = generateDatevCSV(lines);
    const rows = result.split("\r\n");
    expect(rows.length).toBe(3); // Header + 2
    expect(rows[1]).toBe(
      "100,00;1200;8400;100,00;Beitrag 1;01.01.2024;;;"
    );
    expect(rows[2]).toBe(
      "200,00;1200;8400;200,00;Beitrag 2;02.01.2024;;;"
    );
  });

  it("sollte leere Eingabe nur mit Header zurückgeben", () => {
    const result = generateDatevCSV([]);
    expect(result).toBe(
      "Umsatz;Sollkonto;Habenkonto;Betrag;Buchungstext;Belegdatum;Gegenkonto;KOST1;KOST2"
    );
  });

  it("sollte normale Werte ohne Escaping lassen wenn keine Sonderzeichen", () => {
    const lines: DatevLine[] = [
      {
        umsatz: "1000,50",
        sollkonto: "1200",
        habenkonto: "8400",
        betrag: "1000,50",
        buchungstext: "Mitgliedsbeitrag 2024",
        belegdatum: "15.03.2024",
        gegenkonto: "12345",
        kost1: "K1",
        kost2: "K2",
      },
    ];
    const result = generateDatevCSV(lines);
    const dataLine = result.split("\r\n")[1];
    // Keine Anführungszeichen nötig
    expect(dataLine).not.toContain('"');
    expect(dataLine).toBe(
      "1000,50;1200;8400;1000,50;Mitgliedsbeitrag 2024;15.03.2024;12345;K1;K2"
    );
  });
});
