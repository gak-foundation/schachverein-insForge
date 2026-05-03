import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/insforge";
import { generateDatevCSV, type DatevLine } from "@/lib/export/datev-csv";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.clubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentIds } = await request.json();
  if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
    return NextResponse.json({ error: "Keine Zahlungen ausgewaehlt" }, { status: 400 });
  }

  const client = createServiceClient();
  const { data: payments, error } = await client
    .from("payments")
    .select("*, member:members!member_id(first_name, last_name)")
    .eq("club_id", session.user.clubId)
    .in("id", paymentIds);

  if (error) {
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  const lines: DatevLine[] = (payments || []).map((p: any) => ({
    umsatz: p.status === "paid" ? "Einnahme" : "offen",
    sollkonto: "1200",
    habenkonto: "8400",
    betrag: String(p.amount || 0),
    buchungstext: `${p.description || "Beitrag"} - ${p.member?.first_name || ""} ${p.member?.last_name || ""}`,
    belegdatum: p.due_date || new Date().toISOString().split("T")[0],
    gegenkonto: "1000",
  }));

  const csv = generateDatevCSV(lines);
  const filename = `DATEV_Export_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
