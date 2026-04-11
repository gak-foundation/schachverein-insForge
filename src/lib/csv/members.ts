import { z } from "zod";
import type { CreateMemberInput } from "@/lib/validations";

const CSV_MEMBER_HEADERS = [
  "Vorname",
  "Nachname",
  "E-Mail",
  "Telefon",
  "Geburtsdatum",
  "Geschlecht",
  "DWZ",
  "Elo",
  "DWZ-ID",
  "Lichess-Benutzername",
  "Chess.com-Benutzername",
  "Rolle",
  "Status",
  "Foto-Einwilligung",
  "Newsletter-Einwilligung",
  "Notizen",
] as const;

export type CSVMemberRow = {
  Vorname: string;
  Nachname: string;
  "E-Mail": string;
  Telefon?: string;
  Geburtsdatum?: string;
  Geschlecht?: string;
  DWZ?: string;
  Elo?: string;
  "DWZ-ID"?: string;
  "Lichess-Benutzername"?: string;
  "Chess.com-Benutzername"?: string;
  Rolle?: string;
  Status?: string;
  "Foto-Einwilligung"?: string;
  "Newsletter-Einwilligung"?: string;
  Notizen?: string;
};

export function generateMemberCSVTemplate(): string {
  const headers = CSV_MEMBER_HEADERS.join(";");
  const exampleRow = [
    "Max",
    "Mustermann",
    "max@beispiel.de",
    "+49123456789",
    "1990-05-15",
    "maennlich",
    "1850",
    "1900",
    "12345678",
    "maxspieler",
    "maxchess",
    "mitglied",
    "active",
    "ja",
    "ja",
    "Kommentar",
  ].join(";");

  return `${headers}\n${exampleRow}`;
}

export function parseMemberCSV(csvContent: string): {
  data: Partial<CreateMemberInput>[];
  errors: { row: number; message: string }[];
} {
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return { data: [], errors: [{ row: 0, message: "CSV enthaelt keine Datenzeilen" }] };
  }

  const headers = lines[0].split(";").map((h) => h.trim());
  const data: Partial<CreateMemberInput>[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";").map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    const vorname = row["Vorname"] || row["FirstName"] || row["firstName"];
    const nachname = row["Nachname"] || row["LastName"] || row["lastName"];
    const email = row["E-Mail"] || row["Email"] || row["email"];

    if (!vorname || !nachname || !email) {
      errors.push({
        row: i + 1,
        message: `Pflichtfelder fehlen: ${[!vorname && "Vorname", !nachname && "Nachname", !email && "E-Mail"].filter(Boolean).join(", ")}`,
      });
      continue;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        row: i + 1,
        message: `Ungueltige E-Mail-Adresse: ${email}`,
      });
      continue;
    }

    const member: Partial<CreateMemberInput> = {
      firstName: vorname,
      lastName: nachname,
      email,
      phone: row["Telefon"] || row["Phone"] || undefined,
      dateOfBirth: parseDate(row["Geburtsdatum"] || row["DateOfBirth"]),
      gender: parseGender(row["Geschlecht"] || row["Gender"]),
      dwz: parseNumber(row["DWZ"] || row["Dwz"]),
      elo: parseNumber(row["Elo"] || row["ELO"]),
      dwzId: row["DWZ-ID"] || row["DWZId"] || undefined,
      lichessUsername: row["Lichess-Benutzername"] || row["Lichess"] || undefined,
      chesscomUsername: row["Chess.com-Benutzername"] || row["Chesscom"] || undefined,
      role: parseRole(row["Rolle"] || row["Role"]),
      status: parseStatus(row["Status"] || row["Status"]),
      photoConsent: parseBoolean(row["Foto-Einwilligung"] || row["PhotoConsent"]),
      newsletterConsent: parseBoolean(row["Newsletter-Einwilligung"] || row["NewsletterConsent"]),
      notes: row["Notizen"] || row["Notes"] || undefined,
    };

    data.push(member);
  }

  return { data, errors };
}

export function exportMembersToCSV(members: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  dwz?: number | null;
  elo?: number | null;
  dwzId?: string | null;
  lichessUsername?: string | null;
  chesscomUsername?: string | null;
  role: string;
  status: string;
  photoConsent?: boolean | null;
  newsletterConsent?: boolean | null;
  notes?: string | null;
}[]): string {
  const headers = CSV_MEMBER_HEADERS.join(";");
  const rows = members.map((m) => {
    const dob = m.dateOfBirth
      ? typeof m.dateOfBirth === "string"
        ? m.dateOfBirth
        : m.dateOfBirth.toISOString().split("T")[0]
      : "";

    return [
      escapeCsvField(m.firstName),
      escapeCsvField(m.lastName),
      escapeCsvField(m.email),
      escapeCsvField(m.phone ?? ""),
      dob,
      m.gender ?? "",
      m.dwz?.toString() ?? "",
      m.elo?.toString() ?? "",
      m.dwzId ?? "",
      m.lichessUsername ?? "",
      m.chesscomUsername ?? "",
      m.role,
      m.status,
      m.photoConsent ? "ja" : "nein",
      m.newsletterConsent ? "ja" : "nein",
      escapeCsvField(m.notes ?? ""),
    ].join(";");
  });

  return [headers, ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseDate(value?: string): string | undefined {
  if (!value) return undefined;

  const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) return value;

  const germanMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (germanMatch) {
    const [, day, month, year] = germanMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return undefined;
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value.replace(/\s/g, ""), 10);
  return isNaN(num) ? undefined : num;
}

function parseGender(value?: string): "maennlich" | "weiblich" | "divers" | "keine_angabe" | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase().trim();
  if (["m", "männlich", "maennlich", "male", "man"].includes(lower)) return "maennlich";
  if (["w", "weiblich", "female", "woman", "frau"].includes(lower)) return "weiblich";
  if (["d", "divers", "other"].includes(lower)) return "divers";
  if (["x", "keine angabe", "keine_angabe", "nicht angegeben"].includes(lower)) return "keine_angabe";
  return undefined;
}

function parseRole(value?: string): CreateMemberInput["role"] {
  if (!value) return "mitglied";
  const lower = value.toLowerCase().trim();
  const roles: Record<string, CreateMemberInput["role"]> = {
    admin: "admin",
    vorstand: "vorstand",
    sportwart: "sportwart",
    jugendwart: "jugendwart",
    kassenwart: "kassenwart",
    trainer: "trainer",
    mitglied: "mitglied",
    eltern: "eltern",
  };
  return roles[lower] ?? "mitglied";
}

function parseStatus(value?: string): CreateMemberInput["status"] {
  if (!value) return "active";
  const lower = value.toLowerCase().trim();
  const statuses: Record<string, CreateMemberInput["status"]> = {
    active: "active",
    aktiv: "active",
    inactive: "inactive",
    inaktiv: "inactive",
    resigned: "resigned",
    ausgetreten: "resigned",
    honorary: "honorary",
    ehrenmitglied: "honorary",
  };
  return statuses[lower] ?? "active";
}

function parseBoolean(value?: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return ["ja", "yes", "true", "1", "wahr", "an"].includes(lower);
}
